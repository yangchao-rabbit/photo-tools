import React, { useState, useEffect } from 'react'
import { Typography, Button, Card, Progress, Form, Select, Space, Alert, List, message, Switch, Row, Col, InputNumber } from 'antd'
import { FolderOpenOutlined, CopyOutlined, SettingOutlined, CheckCircleOutlined, CloseCircleOutlined, ScanOutlined } from '@ant-design/icons'
import { backend } from 'wjs/go/models'
import { SelectDir, ScanImageFiles, CopyPhotos } from 'wjs/go/backend/FileCopier'

const cardStyle = {
    marginBottom: '16px',
}

const { Text } = Typography
const { Option } = Select

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

const PhotoCopy: React.FC = () => {
    const [sourceDir, setSourceDir] = useState<string>('')
    const [targetDir, setTargetDir] = useState<string>('')
    const [supportedExtensions, setSupportedExtensions] = useState<string[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<string[]>([])
    const [copyOptions, setCopyOptions] = useState<backend.CopyOptions>({
        sourceDir: '',
        targetDir: '',
        fileExtensions: [],
        createDateBasedDir: false,
        useFileDate: false,
        groupByFormat: true,
        dateGranularity: 'month',
        overwrite: false,
        dryRun: false,
        maxDepth: 5,
        copyMetadata: true,
        generateHash: false,
        ignoreHidden: true,
        recursive: true,
    })
    const [scanOptions, setScanOptions] = useState<backend.ScanOptions>({
        sourceDir: '',
        fileExtensions: [],
        ignoreHidden: true,
        recursive: true,
    })

    const [copyState, setCopyState] = useState<CopyState>({
        isCopying: false,
        progress: null,
        result: null,
    })
    const [scannedFiles, setScannedFiles] = useState<string[]>([])

    // 照片拷贝高级选项
    const [createDateBasedDir, setCreateDateBasedDir] = useState<boolean>(false)
    const [useFileDate, setUseFileDate] = useState<boolean>(false)
    const [groupByFormat, setGroupByFormat] = useState<boolean>(true)
    const [dateGranularity, setDateGranularity] = useState<string>('month')
    const [overwrite, setOverwrite] = useState<boolean>(false)
    const [dryRun, setDryRun] = useState<boolean>(false)
    const [maxDepth, setMaxDepth] = useState<number>(5)
    const [copyMetadata, setCopyMetadata] = useState<boolean>(true)
    const [generateHash, setGenerateHash] = useState<boolean>(false)
    const [ignoreHidden, setIgnoreHidden] = useState<boolean>(true)
    const [recursive, setRecursive] = useState<boolean>(true)

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
            setScanOptions({
                sourceDir: sourceDir,
                fileExtensions: selectedExtensions,
                ignoreHidden: ignoreHidden,
                recursive: recursive,
            })
            const files = await ScanImageFiles(scanOptions)
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
            const options: backend.CopyOptions = {
                ...copyOptions,
                sourceDir: sourceDir,
                targetDir: targetDir,
                fileExtensions: selectedExtensions,
                createDateBasedDir: createDateBasedDir,
                useFileDate: useFileDate,
                groupByFormat: groupByFormat,
                dateGranularity: dateGranularity,
                overwrite: overwrite,
                dryRun: dryRun,
                maxDepth: maxDepth,
                copyMetadata: copyMetadata,
                generateHash: generateHash,
                ignoreHidden: ignoreHidden,
                recursive: recursive,
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
                            <Form.Item label="创建日期目录">
                                <Switch checked={createDateBasedDir} onChange={setCreateDateBasedDir} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    根据当前日期创建子目录
                                </Text>
                            </Form.Item>

                            <Form.Item label="按格式分别创建目录">
                                <Switch checked={groupByFormat} onChange={setGroupByFormat} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    将不同格式的文件分别存储到对应目录
                                </Text>
                            </Form.Item>

                            <Form.Item label="日期粒度">
                                <Select value={dateGranularity} onChange={setDateGranularity} style={{ width: '100%' }}>
                                    <Option value="month">按月份</Option>
                                    <Option value="year">按年份</Option>
                                </Select>
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    按日期粒度创建子目录，如果创建日期目录为是，则根据日期粒度创建子目录
                                </Text>
                            </Form.Item>

                            <Form.Item label="使用文件修改日期">
                                <Switch checked={useFileDate} onChange={setUseFileDate} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    根据文件修改时间创建子目录
                                </Text>
                            </Form.Item>

                            <Form.Item label="覆盖目标文件">
                                <Switch checked={overwrite} onChange={setOverwrite} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    覆盖目标文件
                                </Text>
                            </Form.Item>

                            <Form.Item label="最大深度">
                                <InputNumber value={maxDepth} onChange={(value) => setMaxDepth(value || 5)} style={{ width: '100%' }} />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    最大深度
                                </Text>
                            </Form.Item>

                            <Form.Item label="拷贝元数据">
                                <Switch checked={copyMetadata} onChange={setCopyMetadata} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    保留EXIF等元数据信息
                                </Text>
                            </Form.Item>

                            <Form.Item label="忽略隐藏文件">
                                <Switch checked={ignoreHidden} onChange={setIgnoreHidden} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    忽略隐藏文件
                                </Text>
                            </Form.Item>

                            <Form.Item label="递归扫描">
                                <Switch checked={recursive} onChange={setRecursive} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    递归扫描子目录
                                </Text>
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
                            <Form.Item label="测试模式">
                                <Switch checked={dryRun} onChange={setDryRun} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    测试模式
                                </Text>
                            </Form.Item>

                            <Form.Item label="拷贝元数据">
                                <Switch checked={copyMetadata} onChange={setCopyMetadata} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    保留EXIF等元数据信息
                                </Text>
                            </Form.Item>

                            <Form.Item label="生成图片hash值">
                                <Switch checked={generateHash} onChange={setGenerateHash} checkedChildren="是" unCheckedChildren="否" />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    生成图片hash值
                                </Text>
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
                                            <p>总大小: {copyState.result.totalSize}</p>
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
