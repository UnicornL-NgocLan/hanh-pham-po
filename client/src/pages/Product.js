import { useState, useEffect, useRef } from 'react'
import { Button, Drawer, Form, Input, Space, Select, Table } from 'antd'
import { InputNumber } from 'antd'
import { useZustand } from '../zustand.js'
import axios from 'axios'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'

const validExcelFile = [
    '.csv',
    '.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
]

const Product = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    const [data, setData] = useState([])
    const { setProductState, products, uoms } = useZustand()
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)
    const fileInputRef = useRef(null)

    const getProducts = async () => {
        try {
            const { data } = await axios.get('/api/get-products')
            setProductState(data.data)
            setData(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm()
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
    }

    const handleReset = (clearFilters) => {
        clearFilters()
        setSearchText('')
    }

    const handleAddFile = async (e) => {
        try {
            const file = e.target.files
            const fileType = file[0].type
            if (!validExcelFile.includes(fileType))
                return alert('File của bạn phải là excel')

            // Read file into ArrayBuffer
            const buffer = await new Promise((resolve, reject) => {
                const fileReader = new FileReader()
                fileReader.readAsArrayBuffer(file[0])
                fileReader.onload = (e) => resolve(e.target.result)
                fileReader.onerror = (err) => reject(err)
            })

            // Create a worker from public directory
            const worker = new Worker(
                new URL('../workers/excelWorker.worker.js', import.meta.url)
            )

            // Post the buffer to the worker
            worker.postMessage(buffer)

            // Handle response from the worker
            worker.onmessage = async (e) => {
                const { success, data, error } = e.data
                if (success) {
                    const allValueValid = data.every(
                        (i) =>
                            uoms.find((item) => item.name === i.uom) &&
                            i.code &&
                            i.name
                    )

                    if (!allValueValid) {
                        fileInputRef.current.value = ''
                        worker.terminate()
                        return alert(
                            'Kiểm tra lại đơn vị tính có hợp lệ và các thông tin bắt buộc đã nhập?'
                        )
                    }

                    const myMapList = data.map((i) => {
                        const {
                            name,
                            code,
                            length,
                            height,
                            width,
                            leadTime,
                            uom,
                        } = i

                        const myUom = uoms.find((item) => item.name === uom)

                        const processedData = {
                            name,
                            code,
                            length,
                            height,
                            width,
                            leadTime,
                            uom_id: myUom?._id,
                        }

                        return i._id
                            ? axios.patch(
                                  `/api/update-product/${i._id}`,
                                  processedData
                              )
                            : axios.post('/api/create-product', processedData)
                    })

                    await Promise.all(myMapList)
                    await getProducts()
                } else {
                    alert('Lỗi xử lý file: ' + error)
                }

                worker.terminate()
            }

            // Handle worker errors
            worker.onerror = (err) => {
                console.error('Worker error:', err)
                alert('Đã xảy ra lỗi trong quá trình xử lý file.')
                worker.terminate()
            }
        } catch (error) {
            alert('Lỗi không xác định: ' + error?.response?.data?.msg)
        } finally {
            fileInputRef.current.value = ''
        }
    }

    useEffect(() => {
        setData(products)
    }, [])

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(selectedKeys, confirm, dataIndex)
                    }
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() =>
                            clearFilters && handleReset(clearFilters)
                        }
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            })
                            setSearchText(selectedKeys[0])
                            setSearchedColumn(dataIndex)
                        }}
                    >
                        OK
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close()
                        }}
                    >
                        Đóng
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ?.toString()
                ?.toLowerCase()
                ?.includes(value?.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100)
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    })

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('code'),
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'uom',
            key: 'uom',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Chiều dài',
            dataIndex: 'length',
            key: 'length',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Chiều rộng',
            dataIndex: 'width',
            key: 'width',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Chiều cao',
            dataIndex: 'height',
            key: 'height',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Độ trễ giao hàng',
            dataIndex: 'leadTime',
            key: 'leadTime',
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
            <Space.Compact style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={() => setShowDrawer(true)}>
                    Tạo
                </Button>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleAddFile}
                    />
                    <Button
                        color="primary"
                        onClick={() => {
                            fileInputRef.current.click()
                        }}
                    >
                        Upload
                    </Button>
                </div>
            </Space.Compact>
            <Table
                columns={columns}
                size="small"
                rowKey={(record) => record._id}
                dataSource={data.map((i) => {
                    return { ...i, uom: i.uom_id?.name }
                })}
            />
            {showDrawer && (
                <MyDrawer
                    open={showDrawer}
                    onClose={() => setShowDrawer(false)}
                    getProducts={getProducts}
                />
            )}
        </div>
    )
}

export default Product

const MyDrawer = ({ open, onClose, getProducts }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const { uoms } = useZustand()

    const handleOk = async () => {
        try {
            const { name, code, length, height, width, leadTime, uom_id } =
                form.getFieldsValue()
            if (!name || !code)
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-product/${open._id}`, {
                    name,
                    code,
                    length,
                    height,
                    width,
                    leadTime,
                    uom_id,
                })
            } else {
                await axios.post('/api/create-product', {
                    name,
                    code,
                    length,
                    height,
                    width,
                    leadTime,
                    uom_id,
                })
            }
            onClose()
            await getProducts()
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
            form.setFieldValue('code', open?.code)
            form.setFieldValue('length', open?.length)
            form.setFieldValue('width', open?.width)
            form.setFieldValue('height', open?.height)
            form.setFieldValue('leadTime', open?.leadTime)
            form.setFieldValue('uom_id', open?.uom_id?._id)
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
                <Form.Item
                    name="uom_id"
                    label="Đơn vị đo lường"
                    rules={[
                        {
                            required: true,
                            message: 'Hãy chọn đơn vị đo lường',
                        },
                    ]}
                >
                    <Select
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '')
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        options={uoms.map((i) => {
                            return { value: i._id, label: i.name }
                        })}
                    />
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
