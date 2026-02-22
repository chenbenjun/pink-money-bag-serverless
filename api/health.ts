
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok',
    message: 'Pink Money Bag API is running!'
  });
}
