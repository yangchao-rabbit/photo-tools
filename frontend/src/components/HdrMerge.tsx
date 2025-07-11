import React, { useState } from 'react'
import { Typography, Button, Card, Space, Alert, Form, InputNumber, message } from 'antd'
import { FolderOpenOutlined, MergeCellsOutlined } from '@ant-design/icons'

const { Text } = Typography

const HdrMerge: React.FC = () => {
    const [hdrSourceDir, setHdrSourceDir] = useState<string>('')
    const [hdrTargetDir, setHdrTargetDir] = useState<string>('')
    const [exposureStep, setExposureStep] = useState<number>(1.0)
    const [hdrProgress, setHdrProgress] = useState<any>(null)

    const handleHdrMerge = async () => {
        if (!hdrSourceDir || !hdrTargetDir) {
            message.warning('请先选择HDR源目录和目标目录')
            return
        }

        message.info('HDR合并功能正在开发中...')
        // TODO: 实现HDR合并逻辑
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Card title="HDR合并设置" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                        <Text strong>HDR源目录：</Text>
                        <Button
                            icon={<FolderOpenOutlined />}
                            onClick={() => {
                                // TODO: 实现HDR源目录选择
                                message.info('HDR源目录选择功能开发中...')
                            }}
                            style={{ marginLeft: 8 }}
                        >
                            选择HDR源目录
                        </Button>
                        {hdrSourceDir && (
                            <Text code style={{ marginLeft: 8 }}>
                                {hdrSourceDir}
                            </Text>
                        )}
                    </div>

                    <div>
                        <Text strong>HDR目标目录：</Text>
                        <Button
                            icon={<FolderOpenOutlined />}
                            onClick={() => {
                                // TODO: 实现HDR目标目录选择
                                message.info('HDR目标目录选择功能开发中...')
                            }}
                            style={{ marginLeft: 8 }}
                        >
                            选择HDR目标目录
                        </Button>
                        {hdrTargetDir && (
                            <Text code style={{ marginLeft: 8 }}>
                                {hdrTargetDir}
                            </Text>
                        )}
                    </div>
                </Space>
            </Card>

            <Card title="HDR参数设置" style={{ marginBottom: 16 }}>
                <Form layout="vertical">
                    <Form.Item label="曝光步进值">
                        <InputNumber
                            min={0.1}
                            max={5.0}
                            step={0.1}
                            value={exposureStep}
                            onChange={(value) => setExposureStep(value || 1.0)}
                            style={{ width: '100%' }}
                            placeholder="设置曝光步进值（EV）"
                        />
                        <Text type="secondary">推荐值：1.0-2.0 EV</Text>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="HDR操作" style={{ marginBottom: 16 }}>
                <Button type="primary" size="large" icon={<MergeCellsOutlined />} onClick={handleHdrMerge} disabled={!hdrSourceDir || !hdrTargetDir}>
                    开始HDR合并
                </Button>

                <Alert
                    message="HDR合并功能"
                    description="此功能正在开发中，将支持多张不同曝光度的照片合并为HDR图像。"
                    type="info"
                    showIcon
                    style={{ marginTop: 16 }}
                />
            </Card>
        </div>
    )
}

export default HdrMerge
