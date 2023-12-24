const express = require('express');
const unirest = require('unirest');

const app = express();
bodyParser = require('body-parser');

app.use(express.json());

app.use(bodyParser.json());

const otpMap = {};

app.post('/otp', (req, res) => {
    const req1 = unirest('GET', 'https://www.fast2sms.com/dev/bulkV2');
    const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    otpMap[req.headers.phone] = { otp, timestamp: Date.now() };
    console.log("otpMap", otpMap);

    req1.query({
        authorization: 'BDZTf24xkW9pv6UYeaoq01JsR3bPMrNCIOzFSh7QydGH5icgl84noFbjAcINLwxPgkp1QWBfDsOURHS2',
        variables_values: otp.toString(),
        route: 'otp',
        numbers: req.headers.phone,
    });
    console.log("OTP Sending request sent!");

    req1.headers({
        'cache-control': 'no-cache',
    });

    req1.end(function (res1) {
        if (res1.error) {
            console.log("Error: ", res1.error);
            res.status(500).send(res1.error);
        } else {
            console.log("successful");
            const obj = {
                return: res1.body.return,
                request_id: res1.body.request_id,
                message: res1.body.message,
                // otp: otp.toString(),
            };
            res.status(200).json(obj);
        }
    });
});

app.post('/verify-otp', (req, res) => {
    console.log("Verifying otp");
    const phone = req.headers.phone;
    const otp = req.headers.otp;
    // const expectedOtp = '123456';
    console.log(`phone = ${phone}`);
    console.log(`otpMap = `, otpMap);
    if (otpMap[phone] != null) {
        const storedData = otpMap[phone]['otp'];
        console.log(`storedData = ${storedData}`);
        console.log(`typeof storedData = ${typeof storedData}`);
        console.log(`otp = ${otp}`);
        console.log(`typeof otp = ${typeof otp}`);
        const { storedOtp, timestamp } = storedData;
        // if (storedData.toString().isEqual(otp)) {
        if (parseInt(otp, 10) == storedData) { //  && Date.now() - timestamp < 600000

            // 300000 milliseconds (5 minutes) is the validity window for the OTP
            res.status(200).json({ message: 'OTP verification successful' });
        } else {
            res.status(401).json({ message: 'Invalid OTP or OTP expired' });
        }
    } else {
        res.status(404).json({ message: 'Phone number not found' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`OTP Server is running on port ${PORT}`);
});
