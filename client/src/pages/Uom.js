import { useState, useEffect } from 'react'
import { Button, Drawer, Form, Input, Space } from 'antd'
import axios from 'axios'

const Uom = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    return (
        <div>
            <Button type="primary" onClick={() => setShowDrawer(true)}>
                Tạo
            </Button>
            <MyDrawer open={showDrawer} onClose={() => setShowDrawer(false)} />
        </div>
    )
}

export default Uom

const MyDrawer = ({ open, onClose }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleOk = async () => {
        try {
            const { name } = form.getFieldsValue()
            if (!name) return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            await axios.post('/api/create-uom', { name })
            onClose()
        } catch (error) {
            alert(error.response.data.msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('name', open?.name)
        }
    }, [])

    return (
        <Drawer
            title={open?._id ? 'Chỉnh sửa' : 'Tạo mới'}
            closable={{ 'aria-label': 'Close Button' }}
            onClose={onClose}
            open={open}
            width={600}
            extra={
                <Space>
                    <Button
                        onClick={handleOk}
                        type="primary"
                        loading={loading}
                        disabled={loading}
                    >
                        Lưu
                    </Button>
                </Space>
            }
        >
            <Form
                form={form}
                name="dynamic_ruleEdit"
                onFinish={handleOk}
                layout="vertical"
            >
                <Form.Item
                    name="name"
                    label="Tên đơn vị đo lường"
                    rules={[
                        { required: true, message: 'Hãy nhập tên sản phẩm!' },
                    ]}
                >
                    <Input
                        className="w-full"
                        placeholder="Thùng carton ABC..."
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}
