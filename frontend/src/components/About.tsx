import { Modal } from 'antd'
import React from 'react'

const About: React.FC<{
    visible: boolean
    onClose: () => void
}> = ({ visible, onClose }) => {
    return (
        <Modal title="关于" open={visible} onCancel={onClose} width="60%" centered footer={null}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>照片工具</p>
                <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    <strong>版本：</strong>
                    <span>1.0.0</span>
                </p>
                <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    <strong>作者：</strong>
                    <span>YangRabbit</span>
                </p>
            </div>
        </Modal>
    )
}

export default About
