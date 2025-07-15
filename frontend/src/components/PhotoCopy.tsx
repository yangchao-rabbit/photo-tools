import React, { useState, useEffect } from 'react'
import {
    Typography,
    Button,
    Card,
    Progress,
    Form,
    Input,
    Checkbox,
    Select,
    Space,
    Alert,
    List,
    message,
    Switch,
    Row,
    Col,
    DatePicker,
    Flex,
    Divider,
} from 'antd'
import { FolderOpenOutlined, CopyOutlined, SettingOutlined, CheckCircleOutlined, CloseCircleOutlined, ScanOutlined } from '@ant-design/icons'
import { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

// 样式
const photoCopyStyle = {
    margin: '16px',
}

const cardStyle = {
    marginBottom: '16px',
}

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
    const [organizeByMonth, setOrganizeByMonth] = useState<boolean>(false)
    const [organizeByYear, setOrganizeByYear] = useState<boolean>(false)
    const [preserveStructure, setPreserveStructure] = useState<boolean>(false)

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
        <div style={{ padding: '16px' }}>
            <Row gutter={24}>
                {/* 左侧：目录相关参数 */}
                <Col span={12}>
                    <Card title="📁 目录设置" style={cardStyle}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {/* 源目录选择 */}
                            <div>
                                <Text strong>源目录：</Text>
                                <Button icon={<FolderOpenOutlined />} onClick={handleSelectSourceDir} style={{ marginLeft: 8 }}>
                                    选择源目录
                                </Button>
                                {sourceDir && (
                                    <Text code style={{ marginLeft: 8, display: 'block', marginTop: 4 }}>
                                        {sourceDir}
                                    </Text>
                                )}
                            </div>

                            {/* 目标目录选择 */}
                            <div>
                                <Text strong>目标目录：</Text>
                                <Button icon={<FolderOpenOutlined />} onClick={handleSelectTargetDir} style={{ marginLeft: 8 }}>
                                    选择目标目录
                                </Button>
                                {targetDir && (
                                    <Text code style={{ marginLeft: 8, display: 'block', marginTop: 4 }}>
                                        {targetDir}
                                    </Text>
                                )}
                            </div>

                            {/* 扫描按钮 */}
                            <Button type="primary" icon={<ScanOutlined />} onClick={handleScanFiles} disabled={!sourceDir} style={{ marginTop: 8 }}>
                                扫描图片文件
                            </Button>

                            {scannedFiles.length > 0 && <Alert message={`找到 ${scannedFiles.length} 个图片文件`} type="info" showIcon />}
                        </Space>
                    </Card>

                    {/* 目录组织选项 */}
                    <Card title="📂 目录组织" style={cardStyle}>
                        <Form layout="vertical">
                            <Form.Item label="按格式分别创建目录">
                                <Switch checked={splitByFormat} onChange={setSplitByFormat} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    将不同格式的文件分别存储到对应目录
                                </Text>
                            </Form.Item>

                            <Form.Item label="按月份组织">
                                <Switch checked={organizeByMonth} onChange={setOrganizeByMonth} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    根据文件修改时间按月份创建子目录
                                </Text>
                            </Form.Item>

                            <Form.Item label="按年份组织">
                                <Switch checked={organizeByYear} onChange={setOrganizeByYear} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    根据文件修改时间按年份创建子目录
                                </Text>
                            </Form.Item>

                            <Form.Item label="保持原始目录结构">
                                <Switch checked={preserveStructure} onChange={setPreserveStructure} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    在目标目录中保持源目录的文件夹结构
                                </Text>
                            </Form.Item>

                            <Form.Item label="创建新目录">
                                <Switch checked={createNewDir} onChange={setCreateNewDir} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    在目标目录下创建新的子目录
                                </Text>
                            </Form.Item>
                        </Form>
                    </Card>

                    {/* 时间过滤 */}
                    <Card title="⏰ 时间过滤" style={cardStyle}>
                        <Form layout="vertical">
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
                                    style={{ width: '100%' }}
                                />
                                <Text type="secondary">只拷贝指定时间范围内的文件</Text>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* 右侧：通用设置 */}
                <Col span={12}>
                    <Card title="⚙️ 通用设置" style={cardStyle}>
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
                                <Text type="secondary">选择需要拷贝的图片文件格式</Text>
                            </Form.Item>

                            <Form.Item label="拷贝元数据">
                                <Switch checked={copyMetadata} onChange={setCopyMetadata} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    保留EXIF等元数据信息
                                </Text>
                            </Form.Item>

                            <Form.Item label="文件大小限制（MB）">
                                <Input
                                    type="number"
                                    placeholder="0 表示无限制"
                                    value={copyOptions.maxFileSize ? copyOptions.maxFileSize / (1024 * 1024) : ''}
                                    onChange={(e) =>
                                        setCopyOptions((prev) => ({
                                            ...prev,
                                            maxFileSize: parseInt(e.target.value) * 1024 * 1024 || 0,
                                        }))
                                    }
                                    suffix="MB"
                                />
                                <Text type="secondary">只拷贝小于指定大小的文件</Text>
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
                                <Text type="secondary">限制拷贝的文件总数</Text>
                            </Form.Item>
                        </Form>
                    </Card>

                    {/* 拷贝操作 */}
                    <Card title="🚀 拷贝操作" style={cardStyle}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<CopyOutlined />}
                                onClick={handleCopyPhotos}
                                loading={copyState.isCopying}
                                disabled={!sourceDir || !targetDir || selectedExtensions.length === 0}
                                style={{ width: '100%' }}
                            >
                                {copyState.isCopying ? '拷贝中...' : '开始拷贝'}
                            </Button>

                            {(copyState.result || copyState.progress) && (
                                <Button onClick={handleReset} icon={<SettingOutlined />} style={{ width: '100%' }}>
                                    重置状态
                                </Button>
                            )}
                        </Space>

                        {/* 进度显示 */}
                        {copyState.progress && (
                            <div style={{ marginTop: 16 }}>
                                <Progress
                                    percent={copyState.progress.Progress}
                                    status={copyState.progress.Status === '完成' ? 'success' : 'active'}
                                />
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
                                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                                成功: {copyState.result.successCount} 个文件
                                            </p>
                                            <p>
                                                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                                失败: {copyState.result.errorCount} 个文件
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
                </Col>
            </Row>

            {/* 扫描结果 */}
            {scannedFiles.length > 0 && (
                <Card title="📋 扫描结果" style={{ marginTop: 16 }}>
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
