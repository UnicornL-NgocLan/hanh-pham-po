import { useState, useEffect, useRef } from 'react'
import {
    Button,
    Drawer,
    Form,
    Input,
    Space,
    Select,
    Statistic,
    DatePicker,
    Tag,
    Tooltip,
} from 'antd'
import axios from 'axios'
import { Table, Modal, InputNumber } from 'antd'
import { FaTrash } from 'react-icons/fa'
import { useZustand } from '../zustand.js'
import moment from 'moment'
import Highlighter from 'react-highlight-words'
import { DeleteFilled, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { IoPrint } from 'react-icons/io5'
import { MdEdit } from 'react-icons/md'
import {
    exportPurchaseOrderToExcel,
    exportPurchaseRequestToExcel,
} from '../utils/createExcelFile.js'
import { exportSummaryExcelFile } from '../utils/exportSummaryExcelFile.js'
import { FaCirclePlus } from 'react-icons/fa6'

const PurchaseOrder = () => {
    const [showDrawer, setShowDrawer] = useState(false)
    const { setPoState, pos } = useZustand()
    const [data, setData] = useState([])
    const [searchText, setSearchText] = useState('')
    const [loading, setLoading] = useState(false)
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)
    const [printing, setPrinting] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])

    const getPos = async (id = false) => {
        try {
            const { data } = await axios.get('/api/get-pos')
            setPoState(data.data)
            setData(data.data)

            if (showDrawer) {
                const myPO = data.data.find((i) => i._id === id)
                if (myPO) {
                    setShowDrawer(myPO)
                    return true
                }
            }
            return false
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

    const handleDelete = async (record) => {
        try {
            if (window.confirm('Bạn có thực sự muốn xóa ?')) {
                await axios.delete(`/api/delete-po/${record._id}`)
                const { data } = await axios.get('/api/get-pos')
                setPoState(data.data)
                setData(data.data)
                alert('Đã xóa thành công!')
            }
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        }
    }

    const handlePrint = async (record, isPrintPO) => {
        try {
            if (printing) return
            if (!record?._id) return alert('Không tồn tại chứng từ để in')
            setPrinting(true)
            const { data } = await axios.get(`/api/get-po-lines/${record?._id}`)
            if (isPrintPO) {
                await exportPurchaseOrderToExcel(record, data.data)
            } else {
                await exportPurchaseRequestToExcel(record, data.data)
            }
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setPrinting(false)
        }
    }

    const handleExportSummaryFile = async () => {
        try {
            if (loading) return
            setLoading(true)
            const list = selectedRowKeys.map((i) =>
                axios.get(`/api/get-po-lines/${i}`)
            )

            const result = await Promise.all(list)
            const finalList = []
            for (let i = 0; i < result.length; i++) {
                const innerData = result[i].data.data.map((item) => {
                    return { ...item, po: result[i].data.po }
                })
                finalList.push(...innerData)
            }

            let processedData = []
            for (let i = 0; i < finalList.length; i++) {
                const month =
                    moment(finalList[i]?.po?.date).add(7, 'hours').month() + 1
                const stt = finalList[i]?.po?.pr_name?.split('/')[0]?.trim()
                const ncc = finalList[i]?.po?.partner_id?.code.trim()
                const ncc_short_name =
                    finalList[i]?.po?.partner_id?.short_name.trim()
                const so_don_hang = finalList[i]?.po?.name
                const product_name = finalList[i]?.product_id?.name
                const ngay_don_hang = moment(finalList[i]?.po?.date_ordered)
                    .add(7, 'hours')
                    .format('DD/MM/YYYY')
                const ngay_nhan_hang = finalList[i]?.po?.date_deliveried
                    ? moment(finalList[i]?.po?.date_deliveried)
                          .add(7, 'hours')
                          .format('DD/MM/YYYY')
                    : 'thông báo sau'
                const ordered_qty = finalList[i]?.quantity
                const hop_dong = finalList[i]?.po?.contract_id?.code
                const khach_hang = finalList[i]?.po?.buyer_id?.short_name
                const so_de_nghi = finalList[i]?.po?.pr_name || ''
                const can_cu = `Căn cứ vào bảng đề nghị mua vật tư: Số đề nghị ${so_de_nghi} của Phòng Kinh Doanh`
                processedData.push({
                    Tháng: month,
                    STT: stt,
                    NCC: ncc,
                    'Số Đơn Hàng': so_don_hang,
                    'Nhà cung cấp': ncc_short_name,
                    'Tên Hàng': product_name,
                    'Ngày đơn hàng': ngay_don_hang,
                    'Ngày nhận hàng': ngay_nhan_hang,
                    'Số lượng đặt': ordered_qty,
                    'Số lượng nhận': 0,
                    'Số lượng chưa nhận': 0,
                    'NHẬN HÀNG thực tế': 0,
                    'Hợp đồng': hop_dong,
                    'Khách hàng': khach_hang,
                    'Số đề nghị': so_de_nghi,
                    'Căn cứ': can_cu,
                })
            }
            await exportSummaryExcelFile(processedData)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setLoading(false)
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
            title: 'Mã ĐN',
            dataIndex: 'pr_name',
            key: 'pr_name',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('pr_name'),
        },
        {
            title: 'Mã ĐH',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Hợp đồng',
            dataIndex: 'contract',
            key: 'contract',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('contract'),
        },
        {
            title: 'Ngày đặt hàng',
            dataIndex: 'date_ordered',
            key: 'date_ordered',
            align: 'right',
            sorter: (a, b) => moment(a.date_ordered) - moment(b.date_ordered),
            render: (value) => (
                <span>{moment(value).format('DD/MM/YYYY')}</span>
            ),
        },
        {
            title: 'Ngày giao hàng',
            dataIndex: 'date_deliveried',
            key: 'date_deliveried',
            align: 'right',
            sorter: (a, b) =>
                moment(a.date_deliveried) - moment(b.date_deliveried),
            render: (value) => {
                return value ? (
                    <span>{moment(value).format('DD/MM/YYYY')}</span>
                ) : undefined
            },
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'partner',
            key: 'partner',
            render: (text) => <span>{text}</span>,
            ...getColumnSearchProps('partner'),
        },
        {
            title: 'Tiền không thuế',
            dataIndex: 'amount_untaxed',
            key: 'amount_untaxed',
            render: (text) => <span>{Intl.NumberFormat().format(text)}</span>,
        },
        {
            title: 'Thuế',
            dataIndex: 'tax',
            key: 'tax',
            render: (text) => <span>{Intl.NumberFormat().format(text)}</span>,
        },
        {
            title: 'Thành tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (text) => <span>{Intl.NumberFormat().format(text)}</span>,
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
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        onClick={() => setShowDrawer(record)}
                        size="small"
                        disabled={printing}
                    >
                        <MdEdit />
                    </Button>
                    <Tooltip title="In đề nghị mua hàng">
                        <Button
                            onClick={() => handlePrint(record, false)}
                            size="small"
                            disabled={printing}
                        >
                            <IoPrint />
                        </Button>
                    </Tooltip>
                    <Tooltip title="In đơn mua hàng">
                        <Button
                            type="primary"
                            onClick={() => handlePrint(record, true)}
                            size="small"
                            disabled={printing}
                        >
                            <IoPrint />
                        </Button>
                    </Tooltip>
                    <Button
                        danger
                        onClick={() => handleDelete(record)}
                        size="small"
                        disabled={printing}
                    >
                        <DeleteFilled />
                    </Button>
                </Space>
            ),
        },
    ]

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }

    useEffect(() => {
        setData(pos)
    }, [])

    return (
        <div>
            <Space>
                <Button
                    type="primary"
                    onClick={() => setShowDrawer(true)}
                    style={{ marginBottom: 16 }}
                >
                    Tạo
                </Button>
                {selectedRowKeys.length > 0 && (
                    <Button
                        onClick={handleExportSummaryFile}
                        style={{ marginBottom: 16 }}
                    >
                        Xuất file tổng hợp
                    </Button>
                )}
            </Space>
            <Table
                columns={columns}
                rowSelection={rowSelection}
                size="small"
                rowKey={(record) => record._id}
                scroll={{ x: 'max-content' }}
                dataSource={data.map((i) => {
                    return {
                        ...i,
                        partner: i?.partner_id?.short_name,
                        buyer: i?.buyer_id?.short_name,
                        contract: i?.contract_id?.code,
                        pr: i?.pr_id?.name,
                    }
                })}
            />
            {showDrawer && (
                <MyDrawer
                    open={showDrawer}
                    onClose={() => setShowDrawer(false)}
                    getPos={getPos}
                />
            )}
        </div>
    )
}

export default PurchaseOrder

const MyDrawer = ({ open, onClose, getPos }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')
    const searchInput = useRef(null)
    const [showPurchaseOrderLineDrawer, setShowPurchaseOrderLineDrawer] =
        useState(false)
    const {
        partners,
        po_lines,
        setPoLineState,
        contracts,
        setContractState,
        setPartnerState,
    } = useZustand()
    const [filteredContracts, setFilteredContracts] = useState([])
    const [openMyContractDrawer, setOpenMyContractDrawer] = useState(false)
    const [openMyPartnerDrawer, setOpenMyPartnerDrawer] = useState(false)

    const handleGetRespectiveLines = async () => {
        try {
            if (!open?._id) return setPoLineState([])
            setLoading(true)
            const { data } = await axios.get(`/api/get-po-lines/${open?._id}`)
            setPoLineState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setLoading(false)
        }
    }

    const getContracts = async () => {
        try {
            const { data } = await axios.get('/api/get-contracts')
            setContractState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    const getPartners = async () => {
        try {
            const { data } = await axios.get('/api/get-partners')
            setPartnerState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    const handleOk = async () => {
        try {
            const {
                name,
                replacedForContract,
                pr_name,
                partner_id,
                contract_id,
                buyer_id,
                date,
                customer_id,
                date_deliveried,
                delivered_to,
                date_ordered,
                active,
            } = form.getFieldsValue()

            if (
                (!name && open?._id) ||
                (!pr_name && open?._id) ||
                !replacedForContract ||
                !contract_id ||
                !partner_id ||
                !buyer_id ||
                !date_ordered ||
                !date ||
                !customer_id
            )
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')

            setLoading(true)

            let po_id_created
            if (open?._id) {
                await axios.patch(`/api/update-po/${open._id}`, {
                    name,
                    replacedForContract,
                    pr_name,
                    partner_id,
                    buyer_id,
                    contract_id,
                    date,
                    date_deliveried,
                    delivered_to,
                    customer_id,
                    date_ordered,
                    active,
                })
            } else {
                const { data } = await axios.post('/api/create-po', {
                    name,
                    replacedForContract,
                    pr_name,
                    partner_id,
                    contract_id,
                    customer_id,
                    buyer_id,
                    date,
                    date_deliveried,
                    delivered_to,
                    date_ordered,
                })
                po_id_created = data?.data?._id
            }
            const result = await getPos(open?._id || po_id_created)
            if (!result) {
                onClose()
            }
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
            form.setFieldValue('replacedForContract', open?.replacedForContract)
            form.setFieldValue(
                'contract_id',
                open?.contract_id?.map((i) => i._id)
            )
            form.setFieldValue('partner_id', open?.partner_id?._id)
            form.setFieldValue('customer_id', open?.customer_id?._id)
            form.setFieldValue('buyer_id', open?.buyer_id?._id)
            form.setFieldValue('pr_name', open?.pr_name)
            form.setFieldValue('date_ordered', dayjs(open?.date_ordered))
            form.setFieldValue('date', dayjs(open?.date))
            form.setFieldValue(
                'date_deliveried',
                open?.date_deliveried ? dayjs(open?.date_deliveried) : null
            )
            form.setFieldValue('delivered_to', open?.delivered_to)
        } else {
            const myCompany = partners.find((i) => i.isMyCompany)
            form.setFieldValue('date', dayjs(new Date()))
            form.setFieldValue('customer_id', myCompany?._id)
            form.setFieldValue('date_ordered', dayjs(new Date()))
        }
    }, [open])

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
            width: 200,
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
            title: 'Chất lượng tiêu chuẩn',
            dataIndex: 'standard',
            width: 180,
            key: 'standard',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Ngày báo giá',
            dataIndex: 'quotation_date',
            key: 'quotation_date',
            align: 'right',
            sorter: (a, b) =>
                moment(a.quotation_date) - moment(b.quotation_date),
            render: (value) =>
                value ? (
                    <span>{moment(value).format('DD/MM/YYYY')}</span>
                ) : undefined,
        },
        {
            title: 'SL theo HĐ',
            dataIndex: 'contract_quantity',
            key: 'contract_quantity',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'Kho tổng',
            dataIndex: 'kho_tong',
            key: 'kho_tong',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'SL cần thêm',
            dataIndex: 'sl_can_them',
            key: 'sl_can_them',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: '% hao hụt',
            dataIndex: 'loss_rate',
            key: 'loss_rate',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'SL cần mua',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price_unit',
            key: 'price_unit',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
        },
        {
            title: 'Thành tiền',
            dataIndex: 'sub_total',
            key: 'sub_total',
            render: (value) => <span>{Intl.NumberFormat().format(value)}</span>,
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
            fixed: 'right',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        onClick={() => setShowPurchaseOrderLineDrawer(record)}
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
                await axios.delete(`/api/delete-po-line/${record._id}`)
                await handleGetRespectiveLines()
                await getPos(open?._id)
            }
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg || error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const filterData = contracts.filter(
            (i) => i?.partner_id?._id === form.getFieldValue('buyer_id')
        )
        setFilteredContracts(filterData)
    }, [contracts])

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
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="pr_name"
                        label="Mã đề nghị mua hàng"
                    >
                        <Input className="w-full" disabled={!open?._id} />
                    </Form.Item>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="name"
                        label="Mã đơn mua hàng"
                    >
                        <Input className="w-full" disabled={!open?._id} />
                    </Form.Item>
                    <Form.Item
                        name="buyer_id"
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
                            prefix={
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="solid"
                                    onClick={() => setOpenMyPartnerDrawer(true)}
                                >
                                    <FaCirclePlus />
                                </Button>
                            }
                            allowClear
                            onChange={(e) => {
                                const filtered = contracts.filter(
                                    (i) => i.partner_id?._id === e
                                )
                                setFilteredContracts(filtered)
                            }}
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
                        style={{ flex: 1 }}
                        name="contract_id"
                        label="Hợp đồng"
                        rules={[
                            {
                                required: true,
                                message: 'Hãy chọn đề nghị mua hàng',
                            },
                        ]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            prefix={
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="solid"
                                    onClick={() =>
                                        setOpenMyContractDrawer(true)
                                    }
                                >
                                    <FaCirclePlus />
                                </Button>
                            }
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={filteredContracts.map((i) => {
                                return { value: i._id, label: i.code }
                            })}
                        />
                    </Form.Item>
                </Space.Compact>
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
                            prefix={
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="solid"
                                    onClick={() => setOpenMyPartnerDrawer(true)}
                                >
                                    <FaCirclePlus />
                                </Button>
                            }
                            filterOption={(input, option) =>
                                (option?.label ?? '')
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            onChange={(e) => {
                                const current_partner = partners.find(
                                    (i) => i._id === e
                                )
                                if (current_partner) {
                                    form.setFieldValue(
                                        'replacedForContract',
                                        current_partner?.replacedForContract
                                    )
                                }
                            }}
                            options={partners.map((i) => {
                                return { value: i._id, label: i.name }
                            })}
                        />
                    </Form.Item>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="replacedForContract"
                        label="Thay thế cho hợp đồng nguyên tắc"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item
                        style={{ flex: 1 }}
                        name="customer_id"
                        label="Công ty của tôi"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            disabled
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
                        name="date_ordered"
                        style={{ flex: 1 }}
                        label="Ngày đặt hàng"
                        rules={[{ required: true, message: 'Nhập đầy đủ!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="date_deliveried"
                        style={{ flex: 1 }}
                        label="Ngày giao hàng"
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Space.Compact>

                <div style={{ marginBottom: 16 }}>
                    <Space size={100}>
                        <Statistic
                            title="Tiền không thuế"
                            value={
                                open?.amount_untaxed
                                    ? Intl.NumberFormat().format(
                                          open?.amount_untaxed
                                      )
                                    : 0
                            }
                        />
                        <Statistic
                            title="Thuế"
                            value={
                                open?.tax
                                    ? Intl.NumberFormat().format(open?.tax)
                                    : 0
                            }
                        />
                        <Statistic
                            title="Thành tiền"
                            value={
                                open?.total_amount
                                    ? Intl.NumberFormat().format(
                                          open?.total_amount
                                      )
                                    : 0
                            }
                        />
                    </Space>
                </div>

                {open?._id && (
                    <div>
                        <Button
                            type="primary"
                            style={{ marginBottom: 16 }}
                            onClick={() => setShowPurchaseOrderLineDrawer(true)}
                        >
                            Thêm mặt hàng
                        </Button>
                    </div>
                )}
            </Form>

            {showPurchaseOrderLineDrawer && (
                <MyPurchaseRequestLineDrawer
                    open={showPurchaseOrderLineDrawer}
                    handleGetRespectiveLines={handleGetRespectiveLines}
                    onClose={() => setShowPurchaseOrderLineDrawer(false)}
                    pr_id={open?._id}
                    getPos={getPos}
                />
            )}
            <Table
                columns={columns}
                size="small"
                rowKey={(record) => record._id}
                scroll={{ x: 'max-content' }}
                dataSource={po_lines.map((i) => {
                    return {
                        ...i,
                        product: `${
                            i?.product_id?.code
                                ? `[${i?.product_id?.code}] `
                                : ''
                        }${i?.product_id?.name}`,
                        uom: i?.uom_id?.name,
                        sl_can_them: i.contract_quantity - i.kho_tong,
                    }
                })}
            />
            {openMyContractDrawer && (
                <MyContractDrawer
                    open={openMyContractDrawer}
                    onClose={() => setOpenMyContractDrawer(false)}
                    getContracts={getContracts}
                />
            )}

            {openMyPartnerDrawer && (
                <MyPartnerDrawer
                    open={openMyPartnerDrawer}
                    onClose={() => setOpenMyPartnerDrawer(false)}
                    getPartners={getPartners}
                />
            )}
        </Drawer>
    )
}

const MyPurchaseRequestLineDrawer = ({
    open,
    onClose,
    pr_id,
    handleGetRespectiveLines,
    getPos,
}) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const { products, uoms, setProductState } = useZustand()
    const [openMyProductDrawer, setOpenMyProductDrawer] = useState(false)

    const handleOk = async () => {
        try {
            const {
                order_id,
                product_id,
                uom_id,
                quy_cach,
                contract_quantity,
                need_quantity,
                kho_tong,
                loss_rate,
                note,
                standard,
                quotation_date,
                quantity,
                price_unit,
                sub_total,
            } = form.getFieldsValue()
            if (!product_id)
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')

            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-po-line/${open._id}`, {
                    order_id,
                    product_id,
                    uom_id,
                    quy_cach,
                    contract_quantity,
                    need_quantity,
                    kho_tong,
                    quotation_date,
                    loss_rate,
                    note,
                    standard,
                    quantity,
                    price_unit,
                    sub_total,
                })
            } else {
                await axios.post('/api/create-po-line', {
                    order_id: pr_id,
                    product_id,
                    uom_id,
                    quy_cach,
                    contract_quantity,
                    need_quantity,
                    kho_tong,
                    quotation_date,
                    loss_rate,
                    note,
                    standard,
                    quantity,
                    price_unit,
                    sub_total,
                })
            }
            await getPos(pr_id)
            onClose()
            await handleGetRespectiveLines()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    const getProducts = async () => {
        try {
            const { data } = await axios.get('/api/get-products')
            setProductState(data.data)
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        }
    }

    const calculatePrice = () => {
        const quantity = form.getFieldValue('quantity')
        const price_unit = form.getFieldValue('price_unit')

        const sub_total = quantity * price_unit
        form.setFieldValue('sub_total', sub_total)
    }

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('product_id', open?.product_id?._id)
            form.setFieldValue('uom_id', open?.uom_id?._id)
            form.setFieldValue('quantity', open?.quantity)
            form.setFieldValue('price_unit', open?.price_unit)
            form.setFieldValue('sub_total', open?.sub_total)
            form.setFieldValue('note', open?.note)
            form.setFieldValue('standard', open?.standard)
            form.setFieldValue('loss_rate', open?.loss_rate)
            form.setFieldValue('kho_tong', open?.kho_tong)
            form.setFieldValue('contract_quantity', open?.contract_quantity)
            form.setFieldValue('quy_cach', open?.quy_cach)
            form.setFieldValue(
                'quotation_date',
                open?.quotation_date ? dayjs(open?.quotation_date) : undefined
            )
            calculateTotalStock()
            calculatePrice()
        } else {
            form.setFieldValue('quantity', 0)
            form.setFieldValue('price_unit', 0)
            form.setFieldValue('sub_total', 0)
            form.setFieldValue('contract_quantity', 0)
            form.setFieldValue('loss_rate', 0)
            form.setFieldValue('kho_tong', 0)
        }
    }, [])

    const calculateTotalStock = () => {
        const contract_quantity = form.getFieldValue('contract_quantity')
        const loss_rate = form.getFieldValue('loss_rate')

        const kho_tong = form.getFieldValue('kho_tong')
        form.setFieldValue('theoritical_quantity', contract_quantity - kho_tong)
        form.setFieldValue('quantity', contract_quantity - kho_tong + loss_rate)

        calculatePrice()
    }

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
                        style={{ flex: 4 }}
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
                            allowClear
                            prefix={
                                <Button
                                    size="small"
                                    color="primary"
                                    variant="solid"
                                    onClick={() => setOpenMyProductDrawer(true)}
                                >
                                    <FaCirclePlus />
                                </Button>
                            }
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
                                        'quy_cach',
                                        respectiveProduct.quy_cach
                                    )
                                    form.setFieldValue(
                                        'standard',
                                        respectiveProduct.standard
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
                    <Form.Item name="quy_cach" label="Quy cách">
                        <Input className="w-full" />
                    </Form.Item>
                </Space.Compact>
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        name="contract_quantity"
                        label="Số lượng theo hợp đồng"
                        style={{ flex: 1 }}
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
                    <Form.Item
                        name="kho_tong"
                        label="Kho Tổng"
                        style={{ flex: 1 }}
                    >
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
                    <Form.Item
                        style={{ flex: 1 }}
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
                    <Form.Item
                        name="loss_rate"
                        label="Tỷ lệ hao hụt"
                        style={{ flex: 1 }}
                    >
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
                    <Form.Item
                        name="quantity"
                        label="Số lượng cần mua"
                        required
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            onChange={calculatePrice}
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
                </Space.Compact>
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        name="price_unit"
                        required
                        label="Đơn giá (không gồm thuế)"
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            inputMode="decimal"
                            onChange={calculatePrice}
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
                    <Form.Item
                        name="sub_total"
                        label="Thành tiền"
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            readOnly
                            disabled
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
                </Space.Compact>
                <Space.Compact style={{ display: 'flex' }}>
                    <Form.Item
                        name="quotation_date"
                        style={{ flex: 1 }}
                        label="Ngày báo giá"
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="standard"
                        label="Chất lượng tiêu chuẩn"
                        style={{ flex: 1 }}
                    >
                        <Input className="w-full" />
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú" style={{ flex: 1 }}>
                        <Input className="w-full" />
                    </Form.Item>
                </Space.Compact>
            </Form>

            {openMyProductDrawer && (
                <MyProductDrawer
                    open={openMyProductDrawer}
                    onClose={() => setOpenMyProductDrawer(false)}
                    getProducts={getProducts}
                />
            )}
        </Modal>
    )
}

const MyContractDrawer = ({ open, onClose, getContracts }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const { partners } = useZustand()
    const handleOk = async () => {
        try {
            const { code, partner_id } = form.getFieldsValue()
            if (!code) return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-contract/${open._id}`, {
                    code,
                    partner_id,
                })
            } else {
                await axios.post('/api/create-contract', { code, partner_id })
            }
            onClose()
            await getContracts()
        } catch (error) {
            console.log(error)
            alert(error?.response?.data?.msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open?._id) {
            form.setFieldValue('code', open?.code)
            form.setFieldValue('partner_id', open?.partner_id?._id)
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
                    name="code"
                    label="Mã hợp đồng"
                    rules={[
                        { required: true, message: 'Hãy nhập mã hợp đồng!' },
                    ]}
                >
                    <Input className="w-full" />
                </Form.Item>
                <Form.Item name="partner_id" label="Khách hàng">
                    <Select
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '')
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        options={partners.map((i) => {
                            return {
                                value: i._id,
                                label: i.name,
                            }
                        })}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

const MyProductDrawer = ({ open, onClose, getProducts }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const { uoms } = useZustand()

    const handleOk = async () => {
        try {
            const { name, code, quy_cach, standard, uom_id } =
                form.getFieldsValue()
            if (!name || !uom_id)
                return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-product/${open._id}`, {
                    name,
                    code,
                    quy_cach,
                    standard,
                    uom_id,
                })
            } else {
                await axios.post('/api/create-product', {
                    name,
                    code,
                    quy_cach,
                    standard,
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
            form.setFieldValue('quy_cach', open?.quy_cach)
            form.setFieldValue('standard', open?.standard)
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
                <Form.Item name="code" label="Mã sản phẩm">
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
                <Form.Item name="quy_cach" label="Quy cách">
                    <Input className="w-full" placeholder="30x40x70..." />
                </Form.Item>
                <Form.Item name="standard" label="Chất lượng tiêu chuẩn">
                    <Input className="w-full" placeholder="30x40x70..." />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

const MyPartnerDrawer = ({ open, onClose, getPartners }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleOk = async () => {
        try {
            const {
                code,
                name,
                address,
                vat,
                short_name,
                district,
                country,
                replacedForContract,
                phone,
                fax,
                accountNumber,
                city,
                accountBank,
            } = form.getFieldsValue()
            if (!name) return alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
            setLoading(true)
            if (open?._id) {
                await axios.patch(`/api/update-partner/${open._id}`, {
                    code,
                    name,
                    address,
                    vat,
                    short_name,
                    district,
                    country,
                    phone,
                    replacedForContract,
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
                    short_name,
                    fax,
                    replacedForContract,
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
            form.setFieldValue('short_name', open?.short_name)
            form.setFieldValue('country', open?.country)
            form.setFieldValue('vat', open?.vat)
            form.setFieldValue('phone', open?.phone)
            form.setFieldValue('replacedForContract', open?.replacedForContract)
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
                <Form.Item name="short_name" label="Tên viết tắt">
                    <Input className="w-full" placeholder="TH..." />
                </Form.Item>
                <Form.Item name="code" label="Mã liên hệ">
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
                    <Form.Item
                        name="replacedForContract"
                        label="Thay thế HĐ nguyên tắc"
                    >
                        <Input className="w-full" />
                    </Form.Item>
                </Space>
            </Form>
        </Drawer>
    )
}
