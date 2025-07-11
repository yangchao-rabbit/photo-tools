import React, { useState, useEffect } from 'react'
import { Typography, Button, Card, Progress, Form, Input, Checkbox, Select, Space, Alert, List, message, Switch, Row, Col, DatePicker } from 'antd'
import { FolderOpenOutlined, CopyOutlined, SettingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

const { Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

// 临时类型定义，等待Wails生成
interface CopyOptions {
    sourceDir: string
    targetDir: string
    fileExtensions: string[]
    maxFileSize: number
    maxFileCount: number
    preserveStructure: boolean
}

interface CopyResult {
    successCount: number
    errorCount: number
    errors: string[]
    totalSize: number
}

interface CopyState {
    isCopying: boolean
    progress: any | null
    result: CopyResult | null
}

// 临时函数定义，等待Wails生成
const SelectDir = async (): Promise<string> => {
    // TODO: 实现目录选择
    return '临时路径'
}

const GetSupportedExtensions = async (): Promise<string[]> => {
    return [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.bmp',
        '.tiff',
        '.tif',
        '.webp',
        '.svg',
        '.ico',
        '.heic',
        '.heif',
        '.raw',
        '.cr2',
        '.nef',
        '.arw',
        '.dng',
        '.orf',
        '.rw2',
    ]
}

const ScanImageFiles = async (sourceDir: string): Promise<string[]> => {
    // TODO: 实现文件扫描
    return []
}

const CopyPhotos = async (options: CopyOptions): Promise<CopyResult> => {
    // TODO: 实现照片拷贝
    return {
        successCount: 0,
        errorCount: 0,
        errors: [],
        totalSize: 0,
    }
}

const PhotoCopy: React.FC = () => {
    const [sourceDir, setSourceDir] = useState<string>('')
    const [targetDir, setTargetDir] = useState<string>('')
    const [supportedExtensions, setSupportedExtensions] = useState<string[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<string[]>([])
    const [copyOptions, setCopyOptions] = useState<CopyOptions>({
        sourceDir: '',
        targetDir: '',
        fileExtensions: [],
        maxFileSize: 0,
        maxFileCount: 0,
        preserveStructure: false,
    })
    const [copyState, setCopyState] = useState<CopyState>({
        isCopying: false,
        progress: null,
        result: null,
    })
    const [scannedFiles, setScannedFiles] = useState<string[]>([])

    // 照片拷贝高级选项
    const [copyMetadata, setCopyMetadata] = useState<boolean>(true)
    const [splitByFormat, setSplitByFormat] = useState<boolean>(false)
    const [createNewDir, setCreateNewDir] = useState<boolean>(false)
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null)

    // 初始化支持的扩展名
    useEffect(() => {
        GetSupportedExtensions().then((exts) => {
            setSupportedExtensions(exts)
            setSelectedExtensions(exts) // 默认选择所有扩展名
        })
    }, [])

    const handleSelectSourceDir = async () => {
        const result = await SelectDir()
        if (result && !result.startsWith('Error:')) {
            setSourceDir(result)
            setCopyOptions((prev) => ({ ...prev, sourceDir: result }))
        } else if (result.startsWith('Error:')) {
            message.error('选择源目录失败')
        }
    }

    const handleSelectTargetDir = async () => {
        const result = await SelectDir()
        if (result && !result.startsWith('Error:')) {
            setTargetDir(result)
            setCopyOptions((prev) => ({ ...prev, targetDir: result }))
        } else if (result.startsWith('Error:')) {
            message.error('选择目标目录失败')
        }
    }

    const handleScanFiles = async () => {
        if (!sourceDir) {
            message.warning('请先选择源目录')
            return
        }

        try {
            const files = await ScanImageFiles(sourceDir)
            setScannedFiles(files)
            message.success(`扫描完成，找到 ${files.length} 个图片文件`)
        } catch (error) {
            message.error('扫描文件失败')
        }
    }

    const handleCopyPhotos = async () => {
        if (!sourceDir || !targetDir) {
            message.warning('请先选择源目录和目标目录')
            return
        }

        if (selectedExtensions.length === 0) {
            message.warning('请至少选择一种文件类型')
            return
        }

        // 重置状态
        setCopyState({
            isCopying: true,
            progress: null,
            result: null,
        })

        try {
            const options: CopyOptions = {
                ...copyOptions,
                sourceDir: sourceDir,
                targetDir: targetDir,
                fileExtensions: selectedExtensions,
            }

            console.log('Starting copy with options:', options)
            const result = await CopyPhotos(options)
            console.log('Copy completed with result:', result)

            // 设置完成状态
            setCopyState({
                isCopying: false,
                progress: null,
                result: result,
            })

            if (result.successCount > 0) {
                message.success(`拷贝完成！成功: ${result.successCount} 个文件`)
            }
            if (result.errorCount > 0) {
                message.error(`拷贝失败: ${result.errorCount} 个文件`)
            }

            // 延迟清理进度状态，让用户看到完成信息
            setTimeout(() => {
                setCopyState((prev) => ({
                    ...prev,
                    progress: null,
                }))
            }, 3000)
        } catch (error) {
            console.error('Copy error:', error)
            setCopyState({
                isCopying: false,
                progress: null,
                result: null,
            })
            message.error('拷贝过程中发生错误')
        }
    }

    const handleReset = () => {
        setCopyState({
            isCopying: false,
            progress: null,
            result: null,
        })
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* 目录选择 */}
            <Card title="目录设置" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                        <Text strong>源目录：</Text>
                        <Button icon={<FolderOpenOutlined />} onClick={handleSelectSourceDir} style={{ marginLeft: 8 }}>
                            选择源目录
                        </Button>
                        {sourceDir && (
                            <Text code style={{ marginLeft: 8 }}>
                                {sourceDir}
                            </Text>
                        )}
                    </div>

                    <div>
                        <Text strong>目标目录：</Text>
                        <Button icon={<FolderOpenOutlined />} onClick={handleSelectTargetDir} style={{ marginLeft: 8 }}>
                            选择目标目录
                        </Button>
                        {targetDir && (
                            <Text code style={{ marginLeft: 8 }}>
                                {targetDir}
                            </Text>
                        )}
                    </div>

                    <Button type="primary" onClick={handleScanFiles} disabled={!sourceDir}>
                        扫描图片文件
                    </Button>

                    {scannedFiles.length > 0 && <Alert message={`找到 ${scannedFiles.length} 个图片文件`} type="info" showIcon />}
                </Space>
            </Card>

            {/* 高级选项 */}
            <Card title="高级选项" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="拷贝元数据">
                            <Switch checked={copyMetadata} onChange={setCopyMetadata} checkedChildren="是" unCheckedChildren="否" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="按格式拆分存储">
                            <Switch checked={splitByFormat} onChange={setSplitByFormat} checkedChildren="是" unCheckedChildren="否" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="新建目录">
                            <Switch checked={createNewDir} onChange={setCreateNewDir} checkedChildren="是" unCheckedChildren="否" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="时间区间过滤">
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => {
                                    if (dates && dates[0] && dates[1]) {
                                        setDateRange([dates[0], dates[1]])
                                    } else {
                                        setDateRange(null)
                                    }
                                }}
                                showTime
                                placeholder={['开始时间', '结束时间']}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            {/* 拷贝选项 */}
            <Card title="拷贝选项" style={{ marginBottom: 16 }}>
                <Form layout="vertical">
                    <Form.Item label="文件类型过滤">
                        <Select
                            mode="multiple"
                            placeholder="选择要拷贝的文件类型"
                            value={selectedExtensions}
                            onChange={setSelectedExtensions}
                            style={{ width: '100%' }}
                        >
                            {supportedExtensions.map((ext) => (
                                <Option key={ext} value={ext}>
                                    {ext}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="文件大小限制（字节）">
                        <Input
                            type="number"
                            placeholder="0 表示无限制"
                            value={copyOptions.maxFileSize || ''}
                            onChange={(e) =>
                                setCopyOptions((prev) => ({
                                    ...prev,
                                    maxFileSize: parseInt(e.target.value) || 0,
                                }))
                            }
                        />
                    </Form.Item>

                    <Form.Item label="文件数量限制">
                        <Input
                            type="number"
                            placeholder="0 表示无限制"
                            value={copyOptions.maxFileCount || ''}
                            onChange={(e) =>
                                setCopyOptions((prev) => ({
                                    ...prev,
                                    maxFileCount: parseInt(e.target.value) || 0,
                                }))
                            }
                        />
                    </Form.Item>

                    <Form.Item>
                        <Checkbox
                            checked={copyOptions.preserveStructure}
                            onChange={(e) =>
                                setCopyOptions((prev) => ({
                                    ...prev,
                                    preserveStructure: e.target.checked,
                                }))
                            }
                        >
                            保持目录结构
                        </Checkbox>
                    </Form.Item>
                </Form>
            </Card>

            {/* 拷贝操作 */}
            <Card title="拷贝操作" style={{ marginBottom: 16 }}>
                <Space style={{ marginBottom: 16 }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<CopyOutlined />}
                        onClick={handleCopyPhotos}
                        loading={copyState.isCopying}
                        disabled={!sourceDir || !targetDir || selectedExtensions.length === 0}
                    >
                        {copyState.isCopying ? '拷贝中...' : '开始拷贝'}
                    </Button>

                    {(copyState.result || copyState.progress) && (
                        <Button onClick={handleReset} icon={<SettingOutlined />}>
                            重置状态
                        </Button>
                    )}
                </Space>

                {/* 进度显示 */}
                {copyState.progress && (
                    <div style={{ marginTop: 16 }}>
                        <Progress percent={copyState.progress.Progress} status={copyState.progress.Status === '完成' ? 'success' : 'active'} />
                        <Text style={{ marginTop: 8, display: 'block' }}>当前文件: {copyState.progress.CurrentFile || '无'}</Text>
                        <Text style={{ marginTop: 4, display: 'block' }}>
                            进度: {copyState.progress.ProcessedCount} / {copyState.progress.TotalCount}
                        </Text>
                    </div>
                )}

                {/* 结果显示 */}
                {copyState.result && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            message="拷贝结果"
                            description={
                                <div>
                                    <p>
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} /> 成功: {copyState.result.successCount} 个文件
                                    </p>
                                    <p>
                                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> 失败: {copyState.result.errorCount} 个文件
                                    </p>
                                    <p>总大小: {formatFileSize(copyState.result.totalSize)}</p>
                                    {copyState.result.errors.length > 0 && (
                                        <div>
                                            <Text strong>错误详情:</Text>
                                            <List
                                                size="small"
                                                dataSource={copyState.result.errors}
                                                renderItem={(error) => <List.Item>{error}</List.Item>}
                                            />
                                        </div>
                                    )}
                                </div>
                            }
                            type={copyState.result.errorCount > 0 ? 'warning' : 'success'}
                            showIcon
                        />
                    </div>
                )}
            </Card>

            {/* 扫描结果 */}
            {scannedFiles.length > 0 && (
                <Card title="扫描结果" style={{ marginBottom: 16 }}>
                    <List
                        size="small"
                        dataSource={scannedFiles.slice(0, 10)} // 只显示前10个
                        renderItem={(file) => (
                            <List.Item>
                                <Text code>{file}</Text>
                            </List.Item>
                        )}
                        footer={scannedFiles.length > 10 ? <Text type="secondary">还有 {scannedFiles.length - 10} 个文件...</Text> : null}
                    />
                </Card>
            )}
        </div>
    )
}

export default PhotoCopy
