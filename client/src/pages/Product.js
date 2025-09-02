import { useState, useEffect } from 'react'
import { Button, Drawer, Form, Input, Space } from 'antd'
import { InputNumber } from 'antd'

const Product = () => {
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

export default Product

const MyDrawer = ({ open, onClose }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleOk = async () => {
        const { name, code, length, height, width, leadTime } =
            form.getFieldsValue()
        if (!name || !code)
            return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
    }

    useEffect(() => {
        if (open?._id) {
        } else {
            form.setFieldValue('length', 0)
            form.setFieldValue('height', 0)
            form.setFieldValue('width', 0)
            form.setFieldValue('leadTime', 0)
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
                    <Button onClick={handleOk} type="primary">
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
                    label="Tên sản phẩm"
                    rules={[
                        { required: true, message: 'Hãy nhập tên sản phẩm!' },
                    ]}
                >
                    <Input
                        className="w-full"
                        placeholder="Thùng carton ABC..."
                    />
                </Form.Item>
                <Form.Item
                    name="code"
                    label="Mã sản phẩm"
                    rules={[
                        { required: true, message: 'Hãy nhập mã sản phẩm!' },
                    ]}
                >
                    <Input className="w-full" placeholder="KT4AW2..." />
                </Form.Item>
                <Space>
                    <Form.Item name="length" label="Chiều dài">
                        <InputNumber
                            inputMode="decimal"
                            style={{ width: '100%' }}
                            formatter={(value) =>
                                value
                                    ? value
                                          .toString()
                                          .replace(/\B(?=(\d{3})+(?!\d))/g, ',') // thousands with comma
                                    : ''
                            }
                            parser={(value) =>
                                value
                                    ? parseFloat(
                                          value.toString().replace(/,/g, '')
                                      ) // remove commas
                                    : 0
                            }
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item name="width" label="Chiều rộng">
                        <InputNumber
                            inputMode="decimal"
                            style={{ width: '100%' }}
                            formatter={(value) =>
                                value
                                    ? value
                                          .toString()
                                          .replace(/\B(?=(\d{3})+(?!\d))/g, ',') // thousands with comma
                                    : ''
                            }
                            parser={(value) =>
                                value
                                    ? parseFloat(
                                          value.toString().replace(/,/g, '')
                                      ) // remove commas
                                    : 0
                            }
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item name="height" label="Chiều cao">
                        <InputNumber
                            inputMode="decimal"
                            style={{ width: '100%' }}
                            formatter={(value) =>
                                value
                                    ? value
                                          .toString()
                                          .replace(/\B(?=(\d{3})+(?!\d))/g, ',') // thousands with comma
                                    : ''
                            }
                            parser={(value) =>
                                value
                                    ? parseFloat(
                                          value.toString().replace(/,/g, '')
                                      ) // remove commas
                                    : 0
                            }
                            min={0}
                        />
                    </Form.Item>
                </Space>
                <Form.Item name="leadTime" label="Độ trễ giao hàng">
                    <InputNumber
                        inputMode="decimal"
                        style={{ width: '100%' }}
                        formatter={(value) =>
                            value
                                ? value
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',') // thousands with comma
                                : ''
                        }
                        parser={(value) =>
                            value
                                ? parseFloat(value.toString().replace(/,/g, '')) // remove commas
                                : 0
                        }
                        min={0}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}
