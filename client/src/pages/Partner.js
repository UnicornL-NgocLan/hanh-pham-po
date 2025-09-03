import { useState, useEffect, useRef } from 'react'
import { Button, Drawer, Form, Input, Space, Table } from 'antd'
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

const Partner = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    const [data, setData] = useState([])
    const { setPartnerState, partners } = useZustand()
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)
    const fileInputRef = useRef(null)

    const getPartners = async () => {
        try {
            const { data } = await axios.get('/api/get-partners')
            setPartnerState(data.data)
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
                    const allValueValid = data.every((i) => i.code && i.name)

                    if (!allValueValid) {
                        fileInputRef.current.value = ''
                        worker.terminate()
                        return alert(
                            'Kiểm tra lại đơn vị tính có hợp lệ và các thông tin bắt buộc đã nhập?'
                        )
                    }

                    const myMapList = data.map((i) => {
                        const {
                            code,
                            name,
                            address,
                            vat,
                            district,
                            country,
                            phone,
                            fax,
                            accountNumber,
                            city,
                            accountBank,
                        } = i

                        const processedData = {
                            code,
                            name,
                            address,
                            vat,
                            district,
                            country,
                            phone,
                            fax,
                            accountNumber,
                            city,
                            accountBank,
                        }

                        return i._id
                            ? axios.patch(
                                  `/api/update-partner/${i._id}`,
                                  processedData
                              )
                            : axios.post('/api/create-partner', processedData)
                    })

                    await Promise.all(myMapList)
                    await getPartners()
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
        setData(partners)
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
            width: 150,
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
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Phường/Xã',
            dataIndex: 'district',
            key: 'district',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Thành phố',
            dataIndex: 'city',
            key: 'city',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Quốc gia',
            dataIndex: 'country',
            key: 'country',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Fax',
            dataIndex: 'fax',
            key: 'fax',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Mã số thuế',
            dataIndex: 'vat',
            key: 'vat',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Số tài khoản',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Tên ngân hàng',
            dataIndex: 'accountBank',
            key: 'accountBank',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
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
                scroll={{ x: 'max-content' }}
                dataSource={data.map((i) => {
                    return { ...i, uom: i.uom_id?.name }
                })}
            />
            {showDrawer && (
                <MyDrawer
                    open={showDrawer}
                    onClose={() => setShowDrawer(false)}
                    getPartners={getPartners}
                />
            )}
        </div>
    )
}

export default Partner

const MyDrawer = ({ open, onClose, getPartners }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleOk = async () => {
        try {
            const {
                code,
                name,
                address,
                vat,
                district,
                country,
                phone,
                fax,
                accountNumber,
                city,
                accountBank,
            } = form.getFieldsValue()
            if (!name || !code)
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-partner/${open._id}`, {
                    code,
                    name,
                    address,
                    vat,
                    district,
                    country,
                    phone,
                    fax,
                    accountNumber,
                    city,
                    accountBank,
                })
            } else {
                await axios.post('/api/create-partner', {
                    code,
                    name,
                    address,
                    vat,
                    district,
                    country,
                    phone,
                    fax,
                    accountNumber,
                    city,
                    accountBank,
                })
            }
            onClose()
            await getPartners()
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
            form.setFieldValue('address', open?.address)
            form.setFieldValue('district', open?.district)
            form.setFieldValue('city', open?.city)
            form.setFieldValue('country', open?.country)
            form.setFieldValue('vat', open?.vat)
            form.setFieldValue('phone', open?.phone)
            form.setFieldValue('fax', open?.fax)
            form.setFieldValue('accountNumber', open?.accountNumber)
            form.setFieldValue('accountBank', open?.accountBank)
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
                    label="Tên liên hệ"
                    rules={[
                        { required: true, message: 'Hãy nhập tên liên hệ!' },
                    ]}
                >
                    <Input className="w-full" placeholder="Công ty ABC..." />
                </Form.Item>
                <Form.Item
                    name="code"
                    label="Mã liên hệ"
                    rules={[
                        { required: true, message: 'Hãy nhập mã liên hệ!' },
                    ]}
                >
                    <Input className="w-full" placeholder="KT4AW2..." />
                </Form.Item>
                <Space>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="district" label="Phường/Xã">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="city" label="Thành phố">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="country" label="Quốc gia">
                        <Input className="w-full" />
                    </Form.Item>
                </Space>
                <Space>
                    <Form.Item name="phone" label="Số điện thoại">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="vat" label="Mã số thuế">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="fax" label="Fax">
                        <Input className="w-full" />
                    </Form.Item>
                </Space>
                <Space>
                    <Form.Item name="accountNumber" label="Số tài khoản">
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="accountBank" label="Ngân hàng">
                        <Input className="w-full" />
                    </Form.Item>
                </Space>
            </Form>
        </Drawer>
    )
}
