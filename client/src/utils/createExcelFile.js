import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import Stapimex from '../stapimex.png'
import moment from 'moment'

export const exportPurchaseRequestToExcel = async (pr, data) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('DN')

    worksheet.getColumn(15).pageBreak = true

    worksheet.pageSetup = {
        fitToWidth: 1, // fit all columns in one page width
        fitToHeight: 0, // 0 means as many pages as needed for rows
        orientation: 'landscape',
        fitToPage: true,
    }

    worksheet.getRow(1).height = 30
    worksheet.getRow(2).height = 30
    worksheet.getRow(3).height = 30
    worksheet.getRow(4).height = 30
    worksheet.getRow(5).height = 30
    worksheet.getRow(6).height = 30
    worksheet.getRow(7).height = 30
    worksheet.getRow(9).height = 50
    worksheet.getRow(10).height = 30

    worksheet.getColumn(1).width = 5
    worksheet.getColumn(2).width = 25
    worksheet.getColumn(3).width = 10
    worksheet.getColumn(4).width = 15
    worksheet.getColumn(5).width = 15
    worksheet.getColumn(6).width = 12
    worksheet.getColumn(7).width = 9
    worksheet.getColumn(8).width = 9
    worksheet.getColumn(9).width = 9
    worksheet.getColumn(10).width = 12
    worksheet.getColumn(11).width = 12
    worksheet.getColumn(12).width = 12
    worksheet.getColumn(13).width = 12
    worksheet.getColumn(14).width = 12

    // Set value at L1
    worksheet.getCell('L1').value = 'BM 08/QTPB-KD-03'
    // Apply font style
    worksheet.getCell('L1').font = {
        name: 'Times New Roman',
        size: 10,
    }

    // Set value at L2
    worksheet.getCell('L2').value = 'TC: 01'
    // Apply font style
    worksheet.getCell('L2').font = {
        name: 'Times New Roman',
        size: 10,
    }

    // Set value at C4:N4
    worksheet.mergeCells('A4:N4')
    worksheet.getCell('A4').value = 'BẢNG ĐỀ NGHỊ MUA BAO BÌ/ VẬT TƯ'
    // Apply font style
    worksheet.getCell('A4').font = {
        name: 'Times New Roman',
        size: 19,
    }
    worksheet.getCell('A4').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }
    // Fetch the image and convert to ArrayBuffer
    const response = await fetch(Stapimex)
    const imageBlob = await response.blob()
    const arrayBuffer = await imageBlob.arrayBuffer()

    // Add image to workbook
    const imageId = workbook.addImage({
        buffer: arrayBuffer,
        extension: 'png',
    })

    // Place image at A1
    worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 }, // top-left corner at column A (0), row 1 (0)
        ext: { width: 110, height: 98 }, // size in pixels
    })

    worksheet.mergeCells('A5:N5')
    worksheet.getCell('A5').value = 'Bộ phận: Phòng Kinh Doanh'
    // Apply font style
    worksheet.getCell('A5').font = {
        name: 'Times New Roman',
        size: 15,
    }
    worksheet.getCell('A5').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells('A6:N6')
    worksheet.getCell('A6').value = `Số đề nghị ${pr.name}`
    // Apply font style
    worksheet.getCell('A6').font = {
        name: 'Times New Roman',
        size: 15,
    }
    worksheet.getCell('A6').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells('B7:N7')
    worksheet.getCell(
        'B7'
    ).value = `'- Căn cứ vào Quy trình Triển khai đặt và in ấn bao bì (MS: QTTKIABB)`
    // Apply font style
    worksheet.getCell('B7').font = {
        name: 'Times New Roman',
        size: 13,
    }
    worksheet.getCell('B7').alignment = {
        vertical: 'middle',
    }

    worksheet.mergeCells('A8:A9')
    worksheet.getCell('A8').value = `STT`
    // Apply font style
    worksheet.getCell('A8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('A8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells('B8:B9')
    worksheet.getCell('B8').value = `TÊN VẬT TƯ`
    // Apply font style
    worksheet.getCell('B8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('B8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells('C8:C9')
    worksheet.getCell('C8').value = `ĐVT`
    // Apply font style
    worksheet.getCell('C8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('C8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells('D8:D9')
    worksheet.getCell('D8').value = `QUY CÁCH 
(CM)`
    // Apply font style
    worksheet.getCell('D8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('D8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('E8:E9')
    worksheet.getCell('E8').value = `SỬ DỤNG CHO KHÁCH HÀNG/ HỢP ĐỒNG`
    // Apply font style
    worksheet.getCell('E8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('E8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('F8:F9')
    worksheet.getCell('F8').value = `SỐ LƯỢNG THEO HỢP ĐỒNG`
    // Apply font style
    worksheet.getCell('F8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('F8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('G8:J8')
    worksheet.getCell('G8').value = `Tồn đầu kỳ`
    // Apply font style
    worksheet.getCell('G8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('G8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('G9').value = `KHO TỔNG`
    // Apply font style
    worksheet.getCell('G9').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('G9').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('H9').value = `TÂN LONG`
    // Apply font style
    worksheet.getCell('H9').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('H9').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('I9').value = `AN PHÚ`
    // Apply font style
    worksheet.getCell('I9').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('I9').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('J9').value = `TỔNG TỒN`
    // Apply font style
    worksheet.getCell('J9').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('J9').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('K8:K9')
    worksheet.getCell('K8').value = `SỐ LƯỢNG CẦN THÊM`
    // Apply font style
    worksheet.getCell('K8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('K8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('L8:L9')
    worksheet.getCell('L8').value = `TỶ LỆ HAO HỤT (%)`
    // Apply font style
    worksheet.getCell('L8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('L8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('M8:M9')
    worksheet.getCell('M8').value = `SỐ LƯỢNG THỰC TẾ CẦN MUA`
    // Apply font style
    worksheet.getCell('M8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('M8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.mergeCells('N8:N9')
    worksheet.getCell('N8').value = `GHI CHÚ`
    // Apply font style
    worksheet.getCell('N8').font = {
        name: 'Times New Roman',
        size: 10,
    }
    worksheet.getCell('N8').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('A10').value = `(1)`
    // Apply font style
    worksheet.getCell('A10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('A10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('B10').value = `(2)`
    // Apply font style
    worksheet.getCell('B10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('B10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('C10').value = `(3)`
    // Apply font style
    worksheet.getCell('C10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('C10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('D10').value = `(4)`
    // Apply font style
    worksheet.getCell('D10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('D10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('E10').value = `(5)`
    // Apply font style
    worksheet.getCell('E10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('E10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('F10').value = `(6)`
    // Apply font style
    worksheet.getCell('F10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('F10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('G10').value = `(7)`
    // Apply font style
    worksheet.getCell('G10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('G10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('H10').value = `(8)`
    // Apply font style
    worksheet.getCell('H10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('H10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('I10').value = `(9)`
    // Apply font style
    worksheet.getCell('I10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('I10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('J10').value = `(10)=(7)+(8)+(9)`
    // Apply font style
    worksheet.getCell('J10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('J10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('K10').value = `(11)=(6)-(10)`
    // Apply font style
    worksheet.getCell('K10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('K10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('L10').value = `(12)`
    // Apply font style
    worksheet.getCell('L10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('L10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('M10').value = `(13)=(11)+(12)`
    // Apply font style
    worksheet.getCell('M10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('M10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    worksheet.getCell('N10').value = `(14)`
    // Apply font style
    worksheet.getCell('N10').font = {
        name: 'Times New Roman',
        size: 9,
    }
    worksheet.getCell('N10').alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
    }

    const listOfColumn = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'M',
        'N',
    ]
    for (let i = 0; i < data.length; i++) {
        let rowNum = 10 + i + 1
        for (let j = 0; j < listOfColumn.length; j++) {
            let cellValue
            switch (listOfColumn[j]) {
                case 'A':
                    cellValue = i + 1
                    break
                case 'B':
                    cellValue = data[i]?.product_id?.name
                    break
                case 'C':
                    cellValue = data[i]?.uom_id?.name
                    break
                case 'D':
                    cellValue =
                        !data[i].length && !data[i].height && !data[i].width
                            ? ''
                            : data[i].length && data[i].width && !data[i].height
                            ? `${data[i].length} x ${data[i].width}`
                            : `${data[i].length} x ${data[i].width} x ${data[i].height}`
                    break
                case 'E':
                    cellValue =
                        pr?.customer_id?._id && pr?.contract_code
                            ? `${pr?.customer_id?.short_name} - ${pr?.contract_code}`
                            : !pr?.customer && !pr?.contract_code
                            ? ''
                            : `${
                                  pr?.customer_id?.short_name ||
                                  pr?.contract_code
                              }`
                    break
                case 'F':
                    cellValue = data[i].contract_quantity
                    break
                case 'G':
                    cellValue = data[i].kho_tong
                    break
                case 'H':
                    cellValue = data[i].kho_tan_long
                    break
                case 'I':
                    cellValue = data[i].kho_an_phu
                    break
                case 'J':
                    cellValue =
                        data[i].kho_tong +
                        data[i].kho_an_phu +
                        data[i].kho_tan_long
                    break
                case 'K':
                    cellValue =
                        data[i].contract_quantity -
                        data[i].kho_tong +
                        data[i].kho_an_phu +
                        data[i].kho_tan_long
                    break
                case 'L':
                    cellValue = data[i].loss_rate
                    break
                case 'M':
                    cellValue = data[i].need_quantity
                    break
                case 'N':
                    cellValue = data[i].note
                    break
                default:
                    cellValue = ''
            }
            worksheet.getCell(`${listOfColumn[j]}${rowNum}`).value = cellValue
            // Apply font style
            worksheet.getCell(`${listOfColumn[j]}${rowNum}`).font = {
                name: 'Times New Roman',
                size: 11,
            }
            worksheet.getCell(`${listOfColumn[j]}${rowNum}`).alignment = {
                vertical: 'middle',
                wrapText: true,
                horizontal: listOfColumn[j] === 'A' ? 'center' : undefined,
            }
        }
    }

    let endNumRow = 10 + data.length

    for (let row = 8; row <= endNumRow; row++) {
        for (let col = 1; col <= 14; col++) {
            const cell = worksheet.getRow(row).getCell(col)
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            }
        }
    }

    worksheet.getCell(`L${endNumRow + 1}`).value = `Ngày`
    // Apply font style
    worksheet.getCell(`L${endNumRow + 1}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`L${endNumRow + 1}`).alignment = {
        vertical: 'middle',
    }

    worksheet.getCell(`M${endNumRow + 1}`).value = `${String(
        moment(pr.date).add(7, 'hours').date() // use .date() instead of getDate()
    ).padStart(2, '0')}/${String(
        moment(pr.date).add(7, 'hours').month() + 1 // use .month() instead of getMonth()
    ).padStart(2, '0')}/${moment(pr.date).add(7, 'hours').year()}`
    // Apply font style
    worksheet.getCell(`M${endNumRow + 1}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`M${endNumRow + 1}`).alignment = {
        vertical: 'middle',
    }

    worksheet.getCell(`B${endNumRow + 2}`).value = `Ban Tổng Giám Đốc`
    // Apply font style
    worksheet.getCell(`B${endNumRow + 2}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`B${endNumRow + 2}`).alignment = {
        vertical: 'middle',
    }

    worksheet.getCell(`F${endNumRow + 2}`).value = `Phòng kinh doanh`
    // Apply font style
    worksheet.getCell(`F${endNumRow + 2}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`F${endNumRow + 2}`).alignment = {
        vertical: 'middle',
    }

    worksheet.mergeCells(`L${endNumRow + 2}:M${endNumRow + 2}`)
    worksheet.getCell(
        `L${endNumRow + 2}:M${endNumRow + 2}`
    ).value = `Người đề nghị`
    // Apply font style
    worksheet.getCell(`L${endNumRow + 2}:M${endNumRow + 2}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`L${endNumRow + 2}:M${endNumRow + 2}`).alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.mergeCells(`L${endNumRow + 10}:M${endNumRow + 10}`)
    worksheet.getCell(
        `L${endNumRow + 10}:M${endNumRow + 10}`
    ).value = `Phạm Thị Xuân Hạnh`
    // Apply font style
    worksheet.getCell(`L${endNumRow + 10}:M${endNumRow + 10}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`L${endNumRow + 10}:M${endNumRow + 10}`).alignment = {
        horizontal: 'center',
        vertical: 'middle',
    }

    worksheet.getCell(
        `B${endNumRow + 12}`
    ).value = `(2), (3), (4), (5), (6): Thông tin được lấy từ hợp đồng, file thiết kế bao bì`
    // Apply font style
    worksheet.getCell(`B${endNumRow + 12}`).font = {
        name: 'Times New Roman',
        size: 13,
    }
    worksheet.getCell(`B${endNumRow + 12}`).alignment = {
        vertical: 'middle',
    }

    worksheet.getCell(
        `B${endNumRow + 13}`
    ).value = `(7), (8), (9): Số liệu tồn kho do các kho bao bì (Kho Bao bì Tổng, Kho Bao Bì Tân Long, Kho Bao bì An Phú) cung cấp`
    // Apply font style
    worksheet.getCell(`B${endNumRow + 13}`).font = {
        name: 'Times New Roman',
        size: 13,
    }
    worksheet.getCell(`B${endNumRow + 13}`).alignment = {
        vertical: 'middle',
    }

    worksheet.getCell(
        `B${endNumRow + 14}`
    ).value = `(12): căn cứ vào quy định về tỷ lệ đặt hao hụt trong Quy trình Triển khai đặt và in ấn bao bì (mục 3.1.2 trang 4)`
    // Apply font style
    worksheet.getCell(`B${endNumRow + 14}`).font = {
        name: 'Times New Roman',
        size: 14,
    }
    worksheet.getCell(`B${endNumRow + 14}`).alignment = {
        vertical: 'middle',
    }

    // Generate and save the Excel file
    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), 'exported_data.xlsx')
}
