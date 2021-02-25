exports.available = async (req, res, buyer) => {

    let city = req.body.city;

    let t = await buyer.find({city: city});

    return t;

}