const { jsPDF } = require('jspdf');
require('jspdf-autotable');

class PDFService {
  /**
   * Generate invoice PDF
   */
  static async generateInvoice(data) {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GET PLOT', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.text(data.type === 'reservation' ? 'Plot Reservation Invoice' : 'Plot Purchase Invoice', 105, 30, { align: 'center' });

    // Transaction details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Transaction ID: ${data.transactionId}`, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);

    // Customer details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${data.customer.firstName} ${data.customer.lastName}`, 20, 72);
    doc.text(`Email: ${data.customer.email}`, 20, 77);
    doc.text(`Phone: ${data.customer.phone}`, 20, 82);
    doc.text(`Country: ${data.customer.country}`, 20, 87);

    // Property details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Property Details', 20, 100);
    
    const propertyData = [
      ['Plot No', 'Location', 'Area', 'Amount (GHS)'],
      [
        data.property.plotNo,
        data.property.location,
        `${data.property.area} acres`,
        data.amounts.total.toLocaleString(),
      ],
    ];

    doc.autoTable({
      startY: 105,
      head: [propertyData[0]],
      body: [propertyData[1]],
      theme: 'grid',
    });

    // Payment details
    let startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details', 20, startY);

    const paymentData = [
      ['Description', 'Amount (GHS)'],
      ['Total Amount', data.amounts.total.toLocaleString()],
    ];

    if (data.type === 'reservation') {
      paymentData.push(['Minimum Deposit', data.amounts.deposit.toLocaleString()]);
      paymentData.push(['Remaining Amount', data.amounts.remaining.toLocaleString()]);
    }

    doc.autoTable({
      startY: startY + 5,
      head: [paymentData[0]],
      body: paymentData.slice(1),
      theme: 'striped',
    });

    // Bank account details
    startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Instructions', 20, startY);

    // Cedis Account
    doc.setFontSize(11);
    doc.text('Cedis Account', 20, startY + 7);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank: ${data.accounts.cedis.bankName}`, 20, startY + 12);
    doc.text(`Account Name: ${data.accounts.cedis.accountName}`, 20, startY + 17);
    doc.text(`Account Number: ${data.accounts.cedis.accountNumber}`, 20, startY + 22);
    doc.text(`Branch: ${data.accounts.cedis.branchName}`, 20, startY + 27);

    // Dollar Account
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Dollar Account', 20, startY + 37);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank: ${data.accounts.dollar.bankName}`, 20, startY + 42);
    doc.text(`Account Name: ${data.accounts.dollar.accountName}`, 20, startY + 47);
    doc.text(`Account Number: ${data.accounts.dollar.accountNumber}`, 20, startY + 52);
    doc.text(`Branch: ${data.accounts.dollar.branchName}`, 20, startY + 57);

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const footerText = 'For inquiries, contact us at: 0322008282 / +233 54 855 4216 | Office: Kumasi Dichemso, Ghana';
    doc.text(footerText, 105, pageHeight - 15, { align: 'center', maxWidth: 170 });

    return Buffer.from(doc.output('arraybuffer'));
  }
}

module.exports = PDFService;

