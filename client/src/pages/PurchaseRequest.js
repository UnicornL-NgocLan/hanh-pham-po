import { useState, useEffect, useRef } from 'react'
import {
    Button,
    Drawer,
    Form,
    Input,
    Space,
    Select,
    DatePicker,
    Tag,
} from 'antd'
import axios from 'axios'
import { Table, Modal, InputNumber } from 'antd'
import { FaTrash } from 'react-icons/fa'
import { useZustand } from '../zustand.js'
import moment from 'moment'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { IoPrint } from 'react-icons/io5'
import { MdEdit } from 'react-icons/md'
import { exportPurchaseRequestToExcel } from '../utils/createExcelFile.js'

const PurchaseRequest = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    const { setPrState, prs } = useZustand()
    const [data, setData] = useState([])
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)
    const [printing, setPrinting] = useState(false)

    const getPrs = async () => {
        try {
            const { data } = await axios.get('/api/get-prs')
            setPrState(data.data)
            setData(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
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

    const handlePrint = async (record) => {
        try {
            if (printing) return
            if (!record?._id) return alert('Không tồn tại chứng từ để in')
            setPrinting(true)
            const { data } = await axios.get(`/api/get-pr-lines/${record?._id}`)
            await exportPurchaseRequestToExcel(record, data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setPrinting(false)
        }
    }

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
            title: 'Mã',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Ngày đề nghị đặt hàng',
            dataIndex: 'date',
            key: 'date',
            align: 'right',
            width: 200,
            sorter: (a, b) => moment(a.date) - moment(b.date),
            render: (value) => (
                <span>{moment(value).format('DD/MM/YYYY')}</span>
            ),
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'partner',
            key: 'partner',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('partner'),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('customer'),
        },
        {
            title: 'Mã hợp đồng',
            dataIndex: 'contract_code',
            key: 'contract_code',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('contract_code'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'Khả dụng' : 'Bị hủy'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        onClick={() => setShowDrawer(record)}
                        size="small"
                        disabled={printing}
                    >
                        <MdEdit />
                    </Button>
                    <Button
                        onClick={() => handlePrint(record)}
                        size="small"
                        disabled={printing}
                    >
                        <IoPrint />
                    </Button>
                </Space>
            ),
        },
    ]

    useEffect(() => {
        setData(prs)
    }, [])

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
                rowKey={(record) => record._id}
                dataSource={data.map((i) => {
                    return {
                        ...i,
                        partner: i?.partner_id?.name,
                        customer: i?.customer_id?.name,
                    }
                })}
            />
            {showDrawer && (
                <MyDrawer
                    open={showDrawer}
                    onClose={() => setShowDrawer(false)}
                    getPrs={getPrs}
                />
            )}
        </div>
    )
}

export default PurchaseRequest

const MyDrawer = ({ open, onClose, getPrs }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)
    const [showPurchaseRequestLineDrawer, setShowPurchaseRequestLineDrawer] =
        useState(false)
    const { partners, pr_lines, setPrLineState } = useZustand()

    const handleGetRespectiveLines = async () => {
        try {
            if (!open?._id) return
            setLoading(true)
            const { data } = await axios.get(`/api/get-pr-lines/${open?._id}`)
            setPrLineState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setLoading(false)
        }
    }

    const handleOk = async () => {
        try {
            const { partner_id, date, contract_code, active, customer_id } =
                form.getFieldsValue()
            if (!partner_id || !date || !contract_code)
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')

            if (open?._id && active === undefined)
                return alert('Vui lòng chọn trạng thái chứng từ')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-pr/${open._id}`, {
                    partner_id,
                    date,
                    contract_code,
                    active,
                    customer_id,
                })
            } else {
                await axios.post('/api/create-pr', {
                    partner_id,
                    date,
                    contract_code,
                    customer_id,
                })
            }
            onClose()
            await getPrs()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleGetRespectiveLines()
    }, [])

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('name', open?.name)
            form.setFieldValue('partner_id', open?.partner_id?._id)
            form.setFieldValue('customer_id', open?.customer_id?._id)
            form.setFieldValue('date', dayjs(open?.date))
            form.setFieldValue('contract_code', open?.contract_code)
            form.setFieldValue('active', open?.active)
        }
    }, [])

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm()
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)
    }

    const handleReset = (clearFilters) => {
        clearFilters()
        setSearchText('')
    }

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
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('product'),
        },
        {
            title: 'ĐVT',
            dataIndex: 'uom',
            key: 'uom',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Quy cách (cm)',
            dataIndex: 'quy_cach',
            key: 'quy_cach',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Sử dụng cho khách hàng/hợp đồng',
            dataIndex: 'used_for_customer_contract',
            key: 'quy_cach',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Số lượng theo hợp đồng',
            dataIndex: 'contract_quantity',
            key: 'contract_quantity',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Kho Tổng',
            dataIndex: 'kho_tong',
            key: 'kho_tong',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Kho Tân Long',
            dataIndex: 'kho_tan_long',
            key: 'kho_tan_long',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Kho An Phú',
            dataIndex: 'kho_an_phu',
            key: 'kho_an_phu',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Tổng tồn',
            dataIndex: 'tong_ton',
            key: 'tong_ton',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Số lượng cần thêm',
            dataIndex: 'theoritical_quantity',
            key: 'theoritical_quantity',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Tỷ lệ hao hụt',
            dataIndex: 'loss_rate',
            key: 'loss_rate',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Thực tế cần mua',
            dataIndex: 'need_quantity',
            key: 'need_quantity',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Hành động',
            fixed: 'right',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        onClick={() => setShowPurchaseRequestLineDrawer(record)}
                    >
                        <MdEdit />
                    </Button>
                    <Button
                        size="small"
                        danger
                        onClick={() => handleDeleteRecord(record)}
                    >
                        <FaTrash />
                    </Button>
                </Space>
            ),
        },
    ]

    const handleDeleteRecord = async (record) => {
        try {
            if (window.confirm('Bạn có chắc muốn xóa?')) {
                setLoading(true)
                await axios.delete(`/api/delete-pr-line/${record._id}`)
                await handleGetRespectiveLines()
            }
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Drawer
            title={open?._id ? 'Chỉnh sửa' : 'Tạo mới'}
            closable={{ 'aria-label': 'Close Button' }}
            onClose={onClose}
            open={open}
            width={'100%'}
            extra={
                <Space>
                    <Button
                        onClick={onClose}
                        loading={loading}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
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
                {open?._id && (
                    <Form.Item
                        name="name"
                        label="Mã"
                        rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
                    >
                        <Input className="w-full" readOnly disabled />
                    </Form.Item>
                )}
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="partner_id"
                        label="Nhà cung cấp"
                        rules={[
                            {
                                required: true,
                                message: 'Hãy chọn nhà cung cấp',
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
                            options={partners.map((i) => {
                                return { value: i._id, label: i.name }
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        name="customer_id"
                        style={{ flex: 1 }}
                        label="Khách hàng"
                        rules={[
                            {
                                required: true,
                                message: 'Hãy chọn khách hàng',
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
                            options={partners.map((i) => {
                                return { value: i._id, label: i.name }
                            })}
                        />
                    </Form.Item>
                </Space.Compact>
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        name="date"
                        style={{ flex: 1 }}
                        label="Ngày đề nghị đặt hàng"
                        rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="contract_code"
                        label="Mã hợp đồng"
                        style={{ flex: 1 }}
                    >
                        <Input className="w-full" />
                    </Form.Item>

                    {open?._id && (
                        <Form.Item
                            name="active"
                            style={{ flex: 1 }}
                            label="Trạng thái"
                            rules={[
                                {
                                    required: true,
                                    message: 'Hãy chọn đối tác',
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
                                options={[
                                    {
                                        value: true,
                                        label: 'Khả dụng',
                                    },
                                    { value: false, label: 'Bị hủy' },
                                ]}
                            />
                        </Form.Item>
                    )}
                </Space.Compact>

                <div>
                    <Button
                        type="primary"
                        style={{ marginBottom: 16 }}
                        onClick={() => setShowPurchaseRequestLineDrawer(true)}
                    >
                        Thêm mặt hàng
                    </Button>
                </div>
            </Form>
            {showPurchaseRequestLineDrawer && (
                <MyPurchaseRequestLineDrawer
                    open={showPurchaseRequestLineDrawer}
                    handleGetRespectiveLines={handleGetRespectiveLines}
                    onClose={() => setShowPurchaseRequestLineDrawer(false)}
                    pr_id={open?._id}
                />
            )}
            <Table
                columns={columns}
                size="small"
                rowKey={(record) => record._id}
                scroll={{ x: 'max-content' }}
                dataSource={pr_lines.map((i) => {
                    return {
                        ...i,
                        product: `${
                            i?.product_id?.code
                                ? `[${i?.product_id?.code}] `
                                : ''
                        }${i?.product_id?.name}`,
                        uom: i?.uom_id?.name,
                        quy_cach:
                            !i.length && !i.height && !i.width
                                ? ''
                                : i.length && i.width && !i.height
                                ? `${i.length} x ${i.width}`
                                : `${i.length} x ${i.width} x ${i.height}`,
                        used_for_customer_contract:
                            open?.customer_id?._id && open?.contract_code
                                ? `${open?.customer_id?.short_name} - ${open?.contract_code}`
                                : !open?.customer && !open?.contract_code
                                ? ''
                                : `${
                                      open?.customer_id?.short_name ||
                                      open?.contract_code
                                  }`,
                        tong_ton: i.kho_tong + i.kho_an_phu + i.kho_tan_long,
                        theoritical_quantity:
                            i.contract_quantity -
                            i.kho_tong +
                            i.kho_an_phu +
                            i.kho_tan_long,
                    }
                })}
            />
        </Drawer>
    )
}

const MyPurchaseRequestLineDrawer = ({
    open,
    onClose,
    pr_id,
    handleGetRespectiveLines,
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const { products, uoms } = useZustand()

    const handleOk = async () => {
        try {
            const {
                product_id,
                uom_id,
                length,
                width,
                height,
                contract_quantity,
                need_quantity,
                loss_rate,
                kho_tong,
                kho_tan_long,
                kho_an_phu,
                note,
            } = form.getFieldsValue()
            if (!product_id)
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')

            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-pr-line/${open._id}`, {
                    product_id,
                    uom_id,
                    length,
                    width,
                    height,
                    contract_quantity,
                    need_quantity,
                    loss_rate,
                    kho_tong,
                    kho_tan_long,
                    kho_an_phu,
                    note,
                })
            } else {
                await axios.post('/api/create-pr-line', {
                    order_id: pr_id,
                    product_id,
                    uom_id,
                    length,
                    width,
                    height,
                    contract_quantity,
                    need_quantity,
                    loss_rate,
                    kho_tong,
                    kho_tan_long,
                    kho_an_phu,
                    note,
                })
            }
            onClose()
            await handleGetRespectiveLines()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    const calculateTotalStock = () => {
        const contract_quantity = form.getFieldValue('contract_quantity')
        const loss_rate = form.getFieldValue('loss_rate')

        const kho_tong = form.getFieldValue('kho_tong')
        const kho_tan_long = form.getFieldValue('kho_tan_long')
        const kho_an_phu = form.getFieldValue('kho_an_phu')
        const gia_tri_tong = kho_an_phu + kho_tong + kho_tan_long
        form.setFieldValue('tong_ton', gia_tri_tong)
        form.setFieldValue(
            'theoritical_quantity',
            contract_quantity - gia_tri_tong
        )
        form.setFieldValue(
            'need_quantity',
            contract_quantity - gia_tri_tong + loss_rate
        )
    }

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('product_id', open?.product_id?._id)
            form.setFieldValue('uom_id', open?.uom_id?._id)
            form.setFieldValue('width', open?.width)
            form.setFieldValue('length', open?.length)
            form.setFieldValue('height', open?.height)
            form.setFieldValue('contract_quantity', open?.contract_quantity)
            form.setFieldValue('loss_rate', open?.loss_rate)
            form.setFieldValue('kho_tong', open?.kho_tong)
            form.setFieldValue('kho_an_phu', open?.kho_an_phu)
            form.setFieldValue('kho_tan_long', open?.kho_tan_long)
            form.setFieldValue('need_quantity', open?.need_quantity)
            form.setFieldValue('note', open?.note)

            calculateTotalStock()
        } else {
            form.setFieldValue('width', 0)
            form.setFieldValue('length', 0)
            form.setFieldValue('height', 0)
            form.setFieldValue('contract_quantity', 0)
            form.setFieldValue('loss_rate', 0)
            form.setFieldValue('kho_tong', 0)
            form.setFieldValue('kho_an_phu', 0)
            form.setFieldValue('kho_tan_long', 0)
            form.setFieldValue('tong_ton', 0)
            form.setFieldValue('need_quantity', 0)
            form.setFieldValue('theoritical_quantity', 0)
        }
    }, [])

    return (
        <Modal
            title={open?._id ? 'Chỉnh sửa' : 'Tạo mới'}
            closable={{ 'aria-label': 'Close Button' }}
            onCancel={onClose}
            open={open}
            loading={loading}
            okText="Lưu"
            onOk={handleOk}
            cancelText="Hủy"
            width={1000}
        >
            <Form
                form={form}
                name="dynamic_ruleEdit"
                onFinish={handleOk}
                layout="vertical"
            >
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        style={{ flex: 5 }}
                        name="product_id"
                        label="Sản phẩm"
                        rules={[
                            {
                                required: true,
                                message: 'Hãy chọn sản phẩm',
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            onChange={(e) => {
                                const respectiveProduct = products.find(
                                    (item) => item._id === e
                                )
                                if (respectiveProduct) {
                                    form.setFieldValue(
                                        'uom_id',
                                        respectiveProduct.uom_id?._id
                                    )

                                    form.setFieldValue(
                                        'length',
                                        respectiveProduct.length || 0
                                    )

                                    form.setFieldValue(
                                        'width',
                                        respectiveProduct.width || 0
                                    )

                                    form.setFieldValue(
                                        'height',
                                        respectiveProduct.height || 0
                                    )
                                }
                            }}
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={products.map((i) => {
                                return {
                                    value: i._id,
                                    label: `${i.code ? `[${i.code}] ` : ''}${
                                        i.name
                                    }`,
                                }
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        name="uom_id"
                        label="Đơn vị tính"
                        style={{ flex: 2 }}
                    >
                        <Select
                            disabled
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={uoms.map((i) => {
                                return {
                                    value: i._id,
                                    label: i.name,
                                }
                            })}
                        />
                    </Form.Item>
                </Space.Compact>
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
                <Space>
                    <Form.Item
                        name="contract_quantity"
                        label="Số lượng theo hợp đồng"
                    >
                        <InputNumber
                            onChange={calculateTotalStock}
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
                    <Form.Item name="kho_tong" label="Kho Tổng">
                        <InputNumber
                            inputMode="decimal"
                            onChange={calculateTotalStock}
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
                    <Form.Item name="kho_tan_long" label="Kho Tân Long">
                        <InputNumber
                            onChange={calculateTotalStock}
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
                    <Form.Item name="kho_an_phu" label="Kho An Phú">
                        <InputNumber
                            onChange={calculateTotalStock}
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
                    <Form.Item name="tong_ton" label="Tổng tồn">
                        <InputNumber
                            disabled
                            inputMode="decimal"
                            readOnly
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
                <Space>
                    <Form.Item
                        name="theoritical_quantity"
                        label="Số lường cần thêm"
                    >
                        <InputNumber
                            disabled
                            inputMode="decimal"
                            readOnly
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
                    <Form.Item name="loss_rate" label="Tỷ lệ hao hụt">
                        <InputNumber
                            inputMode="decimal"
                            style={{ width: '100%' }}
                            onChange={calculateTotalStock}
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
                    <Form.Item name="need_quantity" label="Số lượng cần mua">
                        <InputNumber
                            inputMode="decimal"
                            disabled
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
                <Form.Item name="note" label="Ghi chú">
                    <Input className="w-full" />
                </Form.Item>
            </Form>
        </Modal>
    )
}
