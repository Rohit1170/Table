const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res)=>{
    res.render(__dirname + "/src/home.ejs");
})


app.post('/update', (req, res) => {
    const formData = req.body;

    fs.readFile('data.json', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        let jsonData = [];

        // Only parse the data if it's not empty
        if (data.length > 0) {
            jsonData = JSON.parse(data);
        }

        if (jsonData.some(entry => entry.serialNumber === formData.serialNumber)) {
            res.render(__dirname + "/src/message.ejs", {message: "Entry already exist!"});
        } else {
            jsonData.push(formData);

            const json = JSON.stringify(jsonData, null, 2);

            fs.writeFile('data.json', json, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('An error occurred while writing to the file.');
                }

                res.render(__dirname + "/src/message.ejs", {message: "Data successfully added!"});
            });
        }
    });
});


app.get('/showdata', (req, res) => {
    fs.readFile('data.json', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        let jsonData = [];

        if (data.length > 0) {
            jsonData = JSON.parse(data);
        }

        res.render(__dirname + "/src/data.ejs", { data: jsonData });
    });
});


app.post('/delete/:id', (req, res) => {
    const id = req.params.id;

    fs.readFile('data.json', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        let jsonData = JSON.parse(data);

        jsonData = jsonData.filter(item => item.serialNumber !== id);

        const json = JSON.stringify(jsonData, null, 2);

        fs.writeFile('data.json', json, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('An error occurred while writing to the file.');
            }

            res.redirect('/showdata');
        });
    });
});

app.get('/edit/:id', (req, res) => {
    const id = req.params.id;

    fs.readFile('data.json', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        const jsonData = JSON.parse(data);
        const item = jsonData.find(item => item.serialNumber === id);

        if (item) {
            res.render(__dirname + "/src/edit.ejs", { item: item });
        } else {
            res.redirect('/showdata');
        }
    });
});

app.post('/update/:id', (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;

    fs.readFile('data.json', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred while reading the file.');
        }

        let jsonData = JSON.parse(data);
        const index = jsonData.findIndex(item => item.serialNumber === id);

        if (index !== -1) {
            jsonData[index] = updatedData;

            const json = JSON.stringify(jsonData, null, 2);

            fs.writeFile('data.json', json, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('An error occurred while writing to the file.');
                }

                res.render(__dirname + "/src/message.ejs", {message:"Data successfully updated!"});
            });
        } else {
            res.redirect('/showdata');
        }
    });
});


app.listen(3000, () => console.log('Server is running on port 3000'));
