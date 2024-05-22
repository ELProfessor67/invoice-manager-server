import catchAsyncError from '../middlewares/catchAsyncError.js';
import InvoiceModel from '../models/invoices.js'; 
import {dirname} from 'path';
import {fileURLToPath} from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url))
import cloudinary from 'cloudinary';
import html_to_pdf from "html-pdf-node"
import { generateInvoiceHTML } from '../utils/generateHtml.js';



export const AddInvoice = catchAsyncError(async (req, res) => {
    try {
        req.body.owner = req.user._id 
        const newData = new InvoiceModel(req.body);
        await newData.save();
        res.status(201).json(newData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


export const deleteInvoice = catchAsyncError(async (req, res) => {
    try {
        const deletedData = await InvoiceModel.findByIdAndDelete(req.params.id);
        if (!deletedData) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.json({ message: 'Data deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export const UpdateInvoice= catchAsyncError(async (req, res) => {
    try {
        const image = req.body.image
        const invoice = await InvoiceModel.findById(req.params.id);
        if(image){
            const result = await cloudinary.v2.uploader.upload(image,{
                folder: "invocie-manager/qr-codes"
            })
            
            if(invoice?.qrcode?.publicId){
                await cloudinary.v2.uploader.destroy(invoice?.qrcode?.publicId)
            }

            req.body.qrcode = {
                publicId: result.public_id,
                url: result.secure_url
            }
        }
        const updatedData = await InvoiceModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedData) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.json(updatedData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});






// export const readInvoice = catchAsyncError(async (req, res) => {
//     try {
//         let allData;
//         if (req.user.role == 'admin'){

//             allData = await InvoiceModel.find();
//         }else{
//             allData = await InvoiceModel.find({owner: req.user._id});

//         }
//         const groupedData = {};

//         allData.forEach(data => {
//             const date = data.date.toLocaleDateString('en-GB', {
//                 day: '2-digit',
//                 month: '2-digit',
//                 year: 'numeric'
//             });
//             if (!groupedData[date]) {
//                 groupedData[date] = [];
//             }
//             groupedData[date].push(data);
//         });

//         res.json(groupedData);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });



export const readInvoice = catchAsyncError(async (req, res) => {
    try {
        let allData;
        if (req.user.role == 'admin'){
            allData = await InvoiceModel.find();
        } else {
            allData = await InvoiceModel.find({ owner: req.user._id });
        }

        const groupedData = [];

        allData.forEach(data => {
            const date = data.date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const invoiceIndex = groupedData.findIndex(item => item.date === date);
            if (invoiceIndex === -1) {
                groupedData.push({ date, invoices: [data], count: 1, total: data.total });
            } else {
                groupedData[invoiceIndex].invoices.push(data);
                groupedData[invoiceIndex].count += 1;
                groupedData[invoiceIndex].total += data.total;
            }
        });

        res.json(groupedData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export const getInvoicesByDate = catchAsyncError(async (req, res) => {
    try {
      
        let allData;
        if (req.user.role === 'admin') {
            allData = await InvoiceModel.find().populate("owner");
        } else {
            allData = await InvoiceModel.find({ owner: req.user._id }).populate("owner");
        }

        const [day,month,year] = req.params.date.split("-")
  

        const filteredData = allData.filter(data => {
            const dataDate = new Date(data.date);
          
            return Number(day) == dataDate.getDate() && Number(month) == dataDate.getMonth()+1 && Number(year) == dataDate.getFullYear();
        });


        res.json(filteredData);
    } catch (err) {
        console.error(err); // Log error
        res.status(500).json({ message: err.message });
    }
});



export const singleInvoice = catchAsyncError(async (req,res) => {
    const id = req.params.id;
    const invoice = await InvoiceModel.findById(id);
    res.json(invoice)
})



export const downloadInvoice = catchAsyncError(async (req,res) => {
    const id = req.params.id;
    const invoice = await InvoiceModel.findById(id);
    let file = {content:generateInvoiceHTML(invoice)}

        let options = { format: 'A4' };

        html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice._id}.pdf`);
            res.setHeader('Content-Length', pdfBuffer.length);
            
            res.send(pdfBuffer)
        }).catch(error => {
            res.json({
                sucess: false,
                message: error.message
            })
        });
})