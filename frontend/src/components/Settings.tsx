import React from 'react'
import { Modal, Form, Switch, InputNumber, Space, Typography } from 'antd'

const { Title } = Typography

interface SettingsProps {
    visible: boolean
    onClose: () => void
}

const Settings: React.FC<SettingsProps> = ({ visible, onClose }) => {
    const [form] = Form.useForm()

    const handleOk = () => {
        form.validateFields().then((values) => {
            console.log('Settings saved:', values)
            onClose()
        })
    }

    return (
        <Modal title="应用设置" open={visible} onOk={handleOk} onCancel={onClose} width={600}>
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    autoScan: true,
                    showProgress: true,
                    maxFileSize: 100 * 1024 * 1024, // 100MB
                    defaultExtensions: ['.jpg', '.png', '.raw'],
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Title level={5}>通用设置</Title>

                    <Form.Item label="自动扫描" name="autoScan">
                        <Switch />
                    </Form.Item>

                    <Form.Item label="显示进度" name="showProgress">
                        <Switch />
                    </Form.Item>

                    <Form.Item label="默认文件大小限制 (MB)" name="maxFileSize">
                        <InputNumber min={1} max={1000} />
                    </Form.Item>

                    <Title level={5}>高级设置</Title>

                    <Form.Item label="启用元数据拷贝" name="copyMetadata">
                        <Switch />
                    </Form.Item>

                    <Form.Item label="启用格式拆分" name="splitByFormat">
                        <Switch />
                    </Form.Item>
                </Space>
            </Form>
        </Modal>
    )
}

export default Settings
