const express = require("express");
const router = express.Router();
const {postAuthor, getAllAuthors, getAuthor, deleteAuthor, updateAuthor} = require("../Controllers/authorController");

// Post author
router.post("/", async (req, res) => {
    await postAuthor(req, res);
});
// Get all authors
router.get("/", async (req, res) => {
    await getAllAuthors(req, res);
});

// Get specified author
router.get("/:id", async (req, res) => {
    await getAuthor(req, res);
});

// Delete author
router.delete("/:id", async (req, res) => {
    await deleteAuthor(req, res);
});

// Update author
router.put("/:id", async(req, res) => {
    await updateAuthor(req, res);
});

module.exports = router;