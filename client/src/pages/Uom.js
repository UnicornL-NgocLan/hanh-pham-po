import { useState, useEffect } from 'react'
import { Button, Drawer, Form, Input, Space } from 'antd'
import axios from 'axios'
import { Table } from 'antd'
import { useZustand } from '../zustand.js'

const Uom = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    const [data, setData] = useState([])
    const { setUomState, uoms } = useZustand()

    const getUoms = async () => {
        try {
            const { data } = await axios.get('/api/get-uoms')
            setUomState(data.data)
            setData(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    useEffect(() => {
        setData(uoms)
    }, [])

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => setShowDrawer(record)}>
                        Chỉnh sửa
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div>
            <Button
                type="primary"
                onClick={() => setShowDrawer(true)}
                style={{ marginBottom: 16 }}
            >
                Tạo
            </Button>
            <Table
                columns={columns}
                size="small"
                dataSource={data}
                rowKey={(record) => record._id}
            />
            {showDrawer && (
                <MyDrawer
                    open={showDrawer}
                    onClose={() => setShowDrawer(false)}
                    getUoms={getUoms}
                />
            )}
        </div>
    )
}

export default Uom

const MyDrawer = ({ open, onClose, getUoms }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleOk = async () => {
        try {
            const { name } = form.getFieldsValue()
            if (!name) return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-uom/${open._id}`, { name })
            } else {
                await axios.post('/api/create-uom', { name })
            }
            onClose()
            await getUoms()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
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
