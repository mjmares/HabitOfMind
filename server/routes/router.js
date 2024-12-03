const express = require("express");
const route = express.Router();
const Entry = require("../model/entry");
// Just importing emitNewEntry from socket
const {emitNewEntry} = require("../socket/socket");

// JSON is an easy way to store static data
const habitsOfMind = require("../model/habitsOfMind.json");

// Pass a path ("/") and callback function => {}
// When the client makes at HTTP GET request to this path
// the callback function is executed
route.get("/", async (req, res) => {
    try {
        const selectedHabit = req.query.habit || ""; // Get the filter parameter
        let filter = {};

        // If a habit filter is applied, add it to the MongoDB query filter
        if (selectedHabit) {
            filter.habit = selectedHabit;
        }

        // Fetch entries from the database with the filter
        const entries = await Entry.find(filter);

        // Format the entries if needed (e.g., toLocaleDateString)
        const formattedEntries = entries.map(entry => ({
            id: entry._id,
            date: entry.date.toLocaleDateString(),
            habit: entry.habit,
            content: entry.content,
        }));

        res.render("index", {
            entries: formattedEntries,
            habits: habitsOfMind,
            selectedHabit, // Pass to EJS to highlight the current selection
        });
    } catch (err) {
        console.error("Error fetching entries:", err);
        res.status(500).send("Internal Server Error");
    }
});



route.get("/createEntry", (req, res) => {
    // Send the HoM object to the createEntry view
    res.render("createEntry", {habits: habitsOfMind})
});

// Handle the POST request for creating new entries
route.post("/createEntry", async (req, res) => {
    const entry = new Entry({
        date: req.body.date,
        email: req.session.email,
        habit: req.body.habit,
        content: req.body.content,
    });

    // Save the new entry to the MongoDB database
    await entry.save();

    // Send this new entry to all connected clients
    emitNewEntry({
        id: entry._id,
        date: entry.date.toLocaleDateString(),
        habit: entry.habit,
        content: entry.content.slice(0, 20) + "...",
    });

    // Send a response of "ok"
    res.status(201).end()
});

// Edit an entry with the id given as a parameter
// Currently this just logs the entry to be edited
route.get("/editEntry/:id", async (req, res) => {
    const entry = await Entry.findById(req.params.id);
    console.log(req.params.id);
    res.render("editEntry", { entry: entry, habits: habitsOfMind, id: req.params.id })
});

route.post("/editEntry", async (req, res) => {
    
    try {
        const entry = await Entry.findById(req.body.id);
        
        if (!entry) {
            return res.status(404).send('Entry not found');
        }

        entry.date = req.body.date;
        entry.habit = req.body.habit;
        entry.content = req.body.content;

        await entry.save();

        emitNewEntry({
            id: entry._id,
            date: entry.date.toLocaleDateString(),
            habit: entry.habit,
            content: entry.content.slice(0, 20) + "...",
        });

        res.status(200).end();
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// Delete Entry Route
route.post("/deleteEntry", async (req, res) => {
    try {
        const { id } = req.body;  // Get the entry ID from the request body

        console.log(id);

        // Find and delete the entry from the database
        const deletedEntry = await Entry.findByIdAndDelete(id);
        
        if (!deletedEntry) {
            return res.status(404).send('Entry not found');
        }

        // Optionally, you can emit a signal or notify the frontend here if needed
        // For example, to notify about the deletion to the frontend
        // emitDeletedEntry(id);

        res.status(200).redirect('/');  // Redirecting to home page (or you can redirect to another page)
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});


// Delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));



module.exports = route;