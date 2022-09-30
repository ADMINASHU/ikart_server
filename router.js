import express  from 'express';
const router = express.Router();

router.get("/", (req, res) => {
  res.send("welcome on ikart server home page");
});


export default router;
