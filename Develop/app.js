const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
})

app.get("/api/notes", (req, res) => {
    fs.readFile(path.join(__dirname, 'db/db.json'), 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Failed to load db.json file' });
        } else {
            res.json(JSON.parse(data));
        }
    });
})

app.post("/api/notes", (req, res) => {
    let newNoteObj = req.body;
    newNoteObj.id = uuidv4();

    fs.readFile(path.join(__dirname, 'db/db.json'),
        'utf-8', (err, data) => {
            if (err) {
                throw err;
            } else {
                let currentNotes = JSON.parse(data);
                currentNotes.push(newNoteObj);

                fs.writeFile(path.join(__dirname, 'db/db.json'),
                    JSON.stringify(currentNotes), err => {
                        if (err) {
                            throw err;
                        } else {
                            res.json(currentNotes);
                            console.log("Note added!");
                        }
                    });
            }
        });
});

app.delete("/api/notes/:id", (req, res) => {
    const currentNoteId = req.params.id;
    fs.readFile(path.join(__dirname, 'db/db.json'), 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Failed to load db.json file' });
        }
        else {
            let currentNotes = JSON.parse(data);
            const filteredNotes = currentNotes.filter(note => note.id !== currentNoteId);
            fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(filteredNotes), err => {
                if (err) {
                    res.status(500).json({ error: 'Failed to delete note with this id' });
                } else {
                    res.json(filteredNotes);
                }
            })
        }
    });
})

app.listen(PORT, () => {
    console.log("App listening to port 3000");
});