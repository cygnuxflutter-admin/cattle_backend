const milk_history = require('../../../model/milk_history');
const sales_report = require('../../../model/sales_report');
const emailService = require('../../../services/email');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');
const blobStream = require('blob-stream');
const sales_transaction = require('../../../model/sales_transaction');
const report = require('../../../model/report');
const reportController = require('../v1/reportController');
const pdf = require('html-pdf');

async function getLastDayMilkData() {
    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const year = yesterday.getFullYear();
        const month = String(yesterday.getMonth() + 1).padStart(2, '0');
        const day = String(yesterday.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;

        const project = {
            createdAt: 0,
            updatedAt: 0,
            isDeleted: 0,
            __v: 0,
            _id: 0
        };

        // const findMilkData = await dbService.findAll(milk_history, { date: formattedDate }, { project });
        const findMilkData = await milk_history.find({ date: formattedDate }, project);
        if (!findMilkData) {
            return findMilkData;
        }

        return findMilkData;

    } catch (error) {
        console.log(error.message);
    }
}

const sendMail = async (req, res) => {
    const mail = req.body.mail;
    const basePath = 'C:\\Users\\Vrushit\\Desktop\\cattleERP-DB\\reportsDataMy'; // Adjust path if needed
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 7); // Generate a random string
    const newHtmlFilePath = path.join(basePath, `MilkReport_${timestamp}-${randomString}.html`);
    const newPdfFilePath = path.join(basePath, `MilkReport_${timestamp}-${randomString}.pdf`);

    try {
        const milkData = await getLastDayMilkData(); // Replace with your logic to fetch milk data

        // Generate HTML table
        let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                table {
                    border-collapse: collapse;
                    width: 100%;
                }
                th, td {
                    border: 1px solid black;
                    padding: 8px;
                    text-align: center;
                }
                th {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <h1>Milk Report</h1>
            <table>
                <tr>
                    <th>Gaushala ID</th>
                    <th>Date</th>
                    <th>Morning Milk</th>
                    <th>Evening Milk</th>
                    <th>Milking Cows (Morning)</th>
                    <th>Milking Cows (Evening)</th>
                    <th>Total Milk</th>
                    <th>Total Milking Cows</th>
                    <th>Total GIR Cows</th>
                </tr>
        `;

        milkData.forEach(rowData => {
            htmlContent += `
                <tr>
                    <td>${rowData['gaushala_id']}</td>
                    <td>${rowData['date']}</td>
                    <td>${rowData['morning_milk']}</td>
                    <td>${rowData['evening_milk']}</td>
                    <td>${rowData['milking_cows_morning']}</td>
                    <td>${rowData['milking_cows_evening']}</td>
                    <td>${rowData['total_milk']}</td>
                    <td>${rowData['total_milking_cows']}</td>
                    <td>${rowData['totalGIRCows']}</td>
                </tr>
            `;
        });

        htmlContent += `
            </table>
        </body>
        </html>
        `;

        // Write HTML content to file
        fs.writeFileSync(newHtmlFilePath, htmlContent);

        // Convert HTML to PDF
        pdf.create(htmlContent).toFile(newPdfFilePath, async (err, _) => {
            if (err) {
                console.error('Error creating PDF:', err);
                return res.internalServerError({ message: 'Error creating PDF' });
            }

            // Delete the temporary HTML file
            fs.unlinkSync(newHtmlFilePath);

            // Send email with PDF attachment
            let mailObj = {
                subject: 'Email Test',
                to: mail,
                template: '/views/email/SuccessfulPasswordReset',
                data: {
                    isWidth: true,
                    email: mail || '-',
                    message: 'Milk Report',
                },
                attachments: [
                    {
                        filename: 'MilkReport.pdf',
                        path: newPdfFilePath, // Attach the PDF file from disk
                    },
                ],
            };

            const mailData = await emailService.sendMail(mailObj); // Replace with your email sending logic

            // Delete the temporary PDF file after sending the email (optional)
            fs.unlinkSync(newPdfFilePath);

            return res.success({ data: mailData }); // Or mailData if sending mail response is desired
        });
    } catch (error) {
        console.error('Error sending email:', error.message);
        return res.internalServerError({ message: error.message });
    }
};

// sales report
const sendSalesEmail = async (req, res) => {
    const mail = req.body.mail;
    //const basePath = 'C:\\Users\\Vrushit\\Desktop\\cattleERP-DB\\reportsDataMy'; // Adjust path if needed
    const basePath = path.resolve(__dirname, '../../../reportsDataMy'); // Adjust the relative path as needed
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 7); // Generate a random string
    const newPdfFilePath = `${basePath}\\SalesReport_${timestamp}-${randomString}.pdf`; // Use backslashes for Windows path

    try {
        const salesData = await salesReportAllDepartmentsMonthly(req); // Replace with your logic to fetch sales data

        // Get unique item names from sales data
        const itemNames = getUniqueItemNames(salesData);

        // Read HTML template file
        const htmlTemplatePath = `${__dirname}/../../../views/email/sales_table_template.html`; // Adjust path to HTML template
        let htmlContent = fs.readFileSync(htmlTemplatePath, 'utf8');

        const monthYearReport = `${getMonthName(req.body.reqMonth)}-${req.body.reqYear}`
        //table main header
        let tableHeader = `
        <tr>
            <th style="color: #7030a0;" colspan="${itemNames.length + 1}"> ${monthYearReport} <br>SRI SRI GAUSHALA BILLING PRODUCTION REPORT</th>
        </tr>
        `;
        htmlContent = htmlContent.replace('<!-- Table header will be dynamically generated here -->', tableHeader);

        // Generate table headers dynamically
        let headersHtml = '<tr>';
        headersHtml += `<th style="background-color: #7030a0; color: white;">Department</th>`;
        itemNames.forEach(itemName => {
            headersHtml += `<th style="background-color: #7030a0; color: white;">${itemName}</th>`;
        });
        headersHtml += '</tr>';

        // Replace table headers placeholder in HTML content
        htmlContent = htmlContent.replace('<!-- Additional header columns will be dynamically generated here -->', headersHtml);

        // Populate table body with sales data
        let bodyHtml = '';
        let grandTotal = {}; // Initialize grand total as an object

        // Initialize grandTotal object with item names as keys
        itemNames.forEach(itemName => {
            grandTotal[itemName] = 0;
        });

        salesData.forEach(sale => {
            bodyHtml += `<tr><td>${sale['department_name']}</td>`;

            itemNames.forEach(itemName => {
                const itemTotal = findItemTotal(sale.items, itemName);
                bodyHtml += `<td>${itemTotal}</td>`;

                // Accumulate grandTotal for each item name
                grandTotal[itemName] += itemTotal === '-' ? 0 : parseInt(itemTotal);
            });
            bodyHtml += '</tr>';
        });

        // Grand total row
        bodyHtml += `<tr style="font-weight: bold; background-color: #7030a0; color: white;"><td>Total Quantity</td>`;
        itemNames.forEach(itemName => {
            bodyHtml += `<td>${grandTotal[itemName]}</td>`;
        });
        bodyHtml += '</tr>';

        // Replace table body placeholder in HTML content
        htmlContent = htmlContent.replace('<!-- Table body will be dynamically generated here -->', bodyHtml);

        // Generate PDF from HTML content
        pdf.create(htmlContent, { format: 'letter' }).toFile(newPdfFilePath, async (err, _) => {
            if (err) {
                console.error('Error creating PDF:', err);
                return res.internalServerError({ message: 'Error creating PDF' });
            }

            // Send email with PDF attachment
            let mailObj = {
                subject: 'Sales Report',
                to: mail,
                template: htmlContent,
                data: {
                    isWidth: true,
                    email: mail || '-',
                    message: 'Sales Report',
                },
                attachments: [
                    {
                        filename: 'SalesReport.pdf',
                        path: newPdfFilePath, // Attach the PDF file from disk
                    },
                ],
            };

            const mailData = await emailService.sendMail(mailObj); // Replace with your email sending logic
            fs.unlinkSync(newPdfFilePath);
            return res.success({ data: mailData }); // Or mailData if sending mail response is desired
            //return res.success({ data: salesData }); // Or mailData if sending mail response is desired
        });
    } catch (error) {
        console.error('Error sending email:', error.message);
        return res.internalServerError({ message: error.message });
    }
};

//get sales data for all departments
async function salesReportAllDepartmentsMonthly(req) {
    try {
        let query = {};
        query.gaushala_id = '01';

        const reqYear = req.body.reqYear;
        const reqMonth = req.body.reqMonth;

        query.date = {
            $regex: `^${reqYear}-${reqMonth}-\\d{2}`, // Matches '2023-10-XX' format
        };

        if (Array.isArray(req.body.department_id) && req.body.department_id.length > 0) {
            // Add a department_id condition using $in to match any of the specified values
            query.department_id = {
                $in: req.body.department_id,
            };
        }

        if (Array.isArray(req.body.item_name) && req.body.item_name.length > 0) {
            // Add an item_name condition using $in to match any of the specified values
            query.item_name = {
                $in: req.body.item_name,
            };
        }

        const pipeline = [
            {
                $match: query,
            },
            {
                $lookup: {
                    from: 'departments',
                    let: { departmentId: '$department_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$department_id', '$$departmentId'] },
                                        { $eq: ['$isDeleted', false] },
                                        { $eq: ['$gaushala_id', query.gaushala_id] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'departmentsData'
                }
            },
            {
                $unwind: '$departmentsData'
            },
            {
                $group: {
                    _id: {
                        gaushala_id: '$gaushala_id',
                        department_id: '$department_id',
                        department_name: '$departmentsData.value',
                        item_name: '$item_name', // Group by item_name within departments
                        rate: '$rate',
                    },
                    qty: { $sum: '$qty' },
                    total: { $sum: '$total' },
                },
            },
            {
                $group: {
                    _id: {
                        gaushala_id: '$_id.gaushala_id',
                        department_id: '$_id.department_id',
                        department_name: '$_id.department_name',
                    },
                    items: {
                        $push: {
                            item_name: '$_id.item_name',
                            rate: '$_id.rate',
                            qty: '$qty',
                            total: '$total',
                        },
                    },
                    grandTotal: { $sum: '$total' },
                },
            },
            {
                $project: {
                    _id: 0,
                    gaushala_id: '$_id.gaushala_id',
                    department_id: '$_id.department_id',
                    department_name: '$_id.department_name',
                    items: 1,
                    grandTotal: 1,
                },
            },
            {
                $sort: {
                    department_id: 1
                }
            },
        ];

        const sales_transactions = await sales_transaction.aggregate(pipeline);

        if (!sales_transactions || sales_transactions.length === 0) {
            console.log('No sales transactions found');
            return [];
        }

        return sales_transactions;
    } catch (error) {
        return error;
    }
};

// Function to find the total for a specific item name within an array of items
function findItemTotal(items, itemName) {
    const item = items.find(item => item.item_name === itemName);
    return item ? item.qty : '-'; // Return empty string if item not found
}

function getUniqueItemNames(data) {
    // Use Set to store unique item names efficiently
    const uniqueItemNames = new Set();

    // Loop through each object in the data array
    for (const item of data) {
        // Access the "items" array inside each object
        const items = item.items;

        // Loop through each item object within the "items" array
        for (const innerItem of items) {
            // Add the item_name to the Set
            uniqueItemNames.add(innerItem.item_name);
        }
    }
    // Convert the Set back to an array for easier access
    const itmes = Array.from(uniqueItemNames);
    // itmes.push('Total');
    return itmes;
}

// sales report over

// stock report 

function getMonthlyExpence(req) {

    const year = req.body.reqYear;
    const month = req.body.reqMonth;
    const gaushala_id = '01'

    return report.aggregate([
        {
            $match: {
                date: {
                    $regex: `^${year}-${month}-\\d{2}`, // Matches '2023-10-XX' format
                },
                gaushala_id: gaushala_id
            },
        },
        {
            $group: {
                _id: {
                    item_type: '$item_type',
                },
                total_expense: { $sum: '$item_amount_add_in_month' },
            },
        },
        {
            $project: {
                _id: 0,
                item_type: '$_id.item_type',
                total_expense: 1,
            },
        }
    ]);
}

//send expense report
const sendExpenseReport = async (req, res) => {

    const mail = req.body.mail;
    //const basePath = 'C:\\Users\\Vrushit\\Desktop\\cattleERP-DB\\reportsDataMy'; // Adjust path if needed
    // const basePath = path.resolve(__dirname, '../../../reportsDataMy'); // Adjust the relative path as needed
    const basePath = path.resolve(__dirname, '../../../temp'); // Adjust path to the 'temp' folder in the root directory
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 7); // Generate a random string
    // const newPdfFilePath = `${basePath}\\ExpenseReport_${timestamp}-${randomString}.pdf`; // Use backslashes for Windows path
    const newPdfFilePath = path.join(basePath, `ExpenseReport_${timestamp}-${randomString}.pdf`); // Create the file path

    const monthlyExpenses = await getMonthlyExpence(req);

    // Read HTML template file
    const htmlTemplatePath = `${__dirname}/../../../views/email/expense_table_template.html`; // Adjust path to HTML template
    let htmlContent = fs.readFileSync(htmlTemplatePath, 'utf8');

    const monthYearReport = `${getMonthName(req.body.reqMonth)}-${req.body.reqYear}`

    //table main header
    let tableHeader = `
    <tr>
        <th style="color: #7030a0;" colspan="3">${monthYearReport}<br>SRI SRI GAUSHALA BILLING EXPENSE REPORT</th>
    </tr>
    `;
    htmlContent = htmlContent.replace('<!-- Table main header -->', tableHeader);

    // Generate table headers dynamically
    let headersHtml = '<tr>';
    headersHtml += '<th style="background-color: #7030a0; color: white;">SR. No</th>';
    headersHtml += '<th style="background-color: #7030a0; color: white;">Item Type</th>';
    headersHtml += '<th style="background-color: #7030a0; color: white;">Total Expense</th>';
    headersHtml += '</tr>';

    htmlContent = htmlContent.replace('<!-- Table sub header -->', headersHtml);

    // Generate table rows dynamically
    let rowsHtml = '';
    let grandTotal = 0;
    let i = 1;
    monthlyExpenses.forEach(item => {
        rowsHtml += '<tr>';
        rowsHtml += `<td>${i++}</td>`;
        rowsHtml += `<td>${item.item_type}</td>`;
        rowsHtml += `<td>${item.total_expense === 0 ? '-' : item.total_expense}</td>`;
        rowsHtml += '</tr>';

        grandTotal += parseInt(item.total_expense) // item.total_expense;
    });

    // Grand total row
    rowsHtml += `<tr style="font-weight: bold; background-color: #7030a0; color: white;"><td colspan="2">Grand Total</td>`;

    rowsHtml += `<td >${grandTotal}</td>`;

    rowsHtml += '</tr>';


    htmlContent = htmlContent.replace('<!-- Table data -->', rowsHtml);

    // Save HTML content to file
    fs.writeFileSync(newPdfFilePath, htmlContent);

    // Send email with attachment
    pdf.create(htmlContent, { format: 'A4' }).toFile(newPdfFilePath, async (err, _) => {
        if (err) {
            console.error('Error creating PDF:', err);
            return res.internalServerError({ message: 'Error creating PDF' });
        }

        // Send email with PDF attachment
        let mailObj = {
            subject: 'Expense Report',
            to: mail,
            template: htmlContent,
            data: {
                isWidth: true,
                email: mail || '-',
                message: 'Expense Report',
            },
            attachments: [
                {
                    filename: 'ExpenseReport.pdf',
                    path: newPdfFilePath, // Attach the PDF file from disk
                },
            ],
        };

        const mailData = await emailService.sendMail(mailObj); // Replace with your email sending logic
        fs.unlinkSync(newPdfFilePath);
        return res.success({ data: mailData }); // Or mailData if sending mail response is desired
    });

};
// stock report over

// Profit Loss Report Start

async function getProfitLossData(req) {

    let options = {};
    let query = {};
    query.gaushala_id = '01';

    // Calculate the start and end dates for the financial year
    const financialYearStart = `${req.body.year}-04-01`;
    const financialYearEnd = `${parseInt(req.body.year) + 1}-03-31`;

    query.date = {
        $gte: financialYearStart,
        $lte: financialYearEnd,
    };

    const getAllCalculations = await reportController.getAllCalculations({ query: query, options: options, year: req.body.year, gaushala_id: '01' });

    const salesData = getAllCalculations.foundSales_reports;
    const expenseData = getAllCalculations.getMonthlyExpence;

    let profitLossData = [];

    for (let i = 0; i < expenseData.length; i++) {

        const date = expenseData[i]._id;

        for (let j = 0; j < salesData.length; j++) {
            const salesdate = salesData[j].date;
            const slicedDate = salesdate.split('-');
            const formatedDate = `${slicedDate[0]}-${slicedDate[1]}`;

            if (formatedDate === date) {

                profitLossData.push({
                    date: `${getMonthName(slicedDate[1])} ${slicedDate[0]}`,
                    total_sales_amount: salesData[j].total_sales_amount.toFixed(2),
                    total_in_stock_amount: expenseData[i].total_in_stock_amount.toFixed(2),
                    opening_amount: expenseData[i].opening_amount.toFixed(2),
                    closing_amount: expenseData[i].closing_amount.toFixed(2)
                })

            }
        }
    }



    return profitLossData
    //return getAllCalculations
}

const sendProfitLossReport = async (req, res) => {
    try {

        const mail = req.body.mail;
        //const basePath = 'C:\\Users\\Vrushit\\Desktop\\cattleERP-DB\\reportsDataMy'; // Adjust path if needed
        const basePath = path.resolve(__dirname, '../../../reportsDataMy'); // Adjust the relative path as needed
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 7); // Generate a random string
        const newPdfFilePath = `${basePath}\\ProfitLossReport_${timestamp}-${randomString}.pdf`; // Use backslashes for Windows path

        const getData = await getProfitLossData(req);


        // Read HTML template file
        const htmlTemplatePath = `${__dirname}/../../../views/email/profit_loss_table_template.html`; // Adjust path to HTML template
        let htmlContent = fs.readFileSync(htmlTemplatePath, 'utf8');


        const params = [{ 'total_sales_amount': 'Total Sales' }, { 'total_in_stock_amount': 'Total Stock' }, { 'opening_amount': 'Opening Stock' }, { 'closing_amount': 'Closing Stock' }];

        const financialYear = `Financial Year ${req.body.year}-${parseInt(req.body.year) + 1}`;

        // Generate table headers dynamically
        let headersHtml = ` <tr>
        <th style="color: #7030a0;" colspan="5">${financialYear}<br>SRI SRI GAUSHALA BUDGET REPORT</th>
    </tr> <tr>`;

        headersHtml += '<th style="background-color: #7030a0; color: white;">Date</th>';
        params.forEach((row) => {
            headersHtml += `<th style="background-color: #7030a0; color: white;">${row[Object.keys(row)[0]]}</th>`;
        })
        headersHtml += '</tr>';
        htmlContent = htmlContent.replace('<!-- Table main header -->', headersHtml);
        let rowsHtml = '';
        let totalSalesAmount = 0;
        let totalInStockAmount = 0;
        let openingAmount = 0;
        let closingAmount = 0;
        getData.forEach((row) => {
            const { date, total_sales_amount, total_in_stock_amount, opening_amount, closing_amount } = row;
            rowsHtml += `<tr> <td style="background-color: #e6d5f3;">${date}</td>`

            rowsHtml += `<td>${total_sales_amount}</td>
                <td>${total_in_stock_amount}</td>
                <td>${opening_amount}</td>
                <td>${closing_amount}</td>
                </tr>
                
                `;

            totalSalesAmount += parseFloat(total_sales_amount) || 0;
            totalInStockAmount += parseFloat(total_in_stock_amount) || 0;
            openingAmount += parseFloat(opening_amount) || 0;
            closingAmount += parseFloat(closing_amount) || 0;
        })

        htmlContent = htmlContent.replace('<!-- Table header will be dynamically generated here -->', rowsHtml);

        let totalHtml = '<tr style="background-color: #7030a0; color: white;">'
        totalHtml += `<td >Total</td>`
        totalHtml += `<td>${totalSalesAmount.toFixed(2)}</td>`
        totalHtml += `<td>${totalInStockAmount.toFixed(2)}</td>`
        totalHtml += `<td>${openingAmount.toFixed(2)}</td>`
        totalHtml += `<td>${closingAmount.toFixed(2)}</td>`
        totalHtml += '</tr>'
        htmlContent = htmlContent.replace('<!-- Total amount will be dynamically generated here -->', totalHtml);

        // Save HTML content to file
        fs.writeFileSync(newPdfFilePath, htmlContent);

        // Send email with PDF attachment
        pdf.create(htmlContent, { format: 'A4', orientation: 'portrait' }).toFile(newPdfFilePath, async (err, _) => {
            if (err) {
                console.error('Error creating PDF:', err);
                return res.internalServerError({ message: 'Error creating PDF' });
            }

            // Send email with PDF attachment
            let mailObj = {
                subject: 'Profit Loss Report',
                to: mail,
                template: htmlContent,
                data: {
                    isWidth: true,
                    email: mail || '-',
                    message: 'Profit Loss Report',
                },
                attachments: [
                    {
                        filename: 'ProfitLossReport.pdf',
                        path: newPdfFilePath, // Attach the PDF file from disk
                    },
                ],
            };

            const mailData = await emailService.sendMail(mailObj); // Replace with your email sending logic
            fs.unlinkSync(newPdfFilePath);
            return res.success({ data: mailData }); // Or mailData if sending mail response is desired
            //return res.success({ data: getData }); // Or mailData if sending mail response is desired
        });



    } catch (error) {
        console.error('Error sending email:', error);
        return res.internalServerError({ message: error });
    }
}

// Profit Loss Report

const getMonthName = (monthNumber) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNumber, 10) - 1];
};
module.exports = { sendMail, sendSalesEmail, sendExpenseReport, sendProfitLossReport };