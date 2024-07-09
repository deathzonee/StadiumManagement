const { Stadium } = require("../model/stadium");
const { search } = require("../router/stadiumRouter");
const { uploadImage } = require("../uploadImage/uploadImage");

const stadiumController = {
    addStadium: async (req, res) => {
        try {
            const { stadium_name, address, phone, image, describe, stadium_style } =
              req.body;
            const uploadedImage = await uploadImage(image);
            const uploadedStadiumStyleImage = await uploadImage(stadium_style.image);
            const response = await Stadium.create({
              image: uploadedImage.secure_url,
              stadium_name: stadium_name,
              address: address,
              describe: describe,
              stadium_style: {
                name: stadium_style.name,
                type: stadium_style.type,
                image: uploadedStadiumStyleImage.secure_url,
                price: stadium_style.price
              },
              phone: phone,
            });
            return res.status(200).json({ success: true, data: response });
          } catch (err) {
            console.log("🚀 ~ addStadium: ~ err:", err);
            return res
              .status(500)
              .json({ success: false, message: "Error create stadium" });
          }
    },

    // Get all stadiums
    getAllStadium: async (req, res) => {
        try {
            const stadiums = await Stadium.find({}).populate("stadium_owner");
            res.status(200).json(stadiums);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Get a specific stadium
    getAnStadium: async (req, res) => {
        try {
            const { id } = req.params;
            const stadium = await Stadium.findById(id).populate("stadium_owner");
            res.status(200).json(stadium);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Update a stadium
    updateStadium: async (req, res) => {
        try {
            const stadium = await Stadium.findById(req.params.id);
            await stadium.updateOne({ $set: req.body });
            res.status(200).json("Updated successfully");
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Delete a stadium
    deleteStadium: async (req, res) => {
        try {
            await Stadium.findByIdAndDelete(req.params.id);
            res.status(200).json("Deleted successfully");
        } catch (err) {
            res.status(500).json(err);
        }
    },
    
    searchStadium: async (req, res) => {
        try {
            // Nếu query là một mảng, sử dụng nó, nếu không, chuyển đổi thành một mảng
            const queries = Array.isArray(req.query.query) ? req.query.query : [req.query.query];
            
            // Tạo một mảng các điều kiện tìm kiếm cho mỗi query
            const regexQueries = queries.map(q => ({
                $or: [
                    { stadium_name: { $regex: q, $options: 'i' } },
                    { address: { $regex: q, $options: 'i' } }
                ]
            }));
    
            // Sử dụng toán tử $and để kết hợp tất cả các điều kiện
            const query = { $and: regexQueries };
            
            const projection = {
                _id: 0,
                stadium_name: 1,
                address: 1,
                phone: 1,
            };
            
            const stadiums = await Stadium.find(query, projection);
            res.status(200).json(stadiums);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    

    // Add a StadiumStyle to a specific Stadium
    addStadiumStyle: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('Stadium ID:', id);
            const stadiumStyle = req.body;

            const stadium = await Stadium.findById(id);
            if (!stadium) {
                return res.status(404).json("Stadium not found");
            }

            stadium.stadium_styles.push(stadiumStyle);
            const updatedStadium = await stadium.save();
            res.status(200).json(updatedStadium);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    updateStadiumStyle: async (req, res) => {
        try {
            const { id, stadiumStyleId } = req.params;
            const updatedData = req.body;

            const stadium = await Stadium.findById(id);
            if (!stadium) {
                return res.status(404).json("Stadium not found");
            }

            const style = stadium.stadium_styles.id(stadiumStyleId);
            if (!style) {
                return res.status(404).json("StadiumStyle not found");
            }

            // Cập nhật các trường của stadiumStyle
            style.set(updatedData);

            await stadium.save();
            res.status(200).json(style);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    deleteStadiumStyle: async (req, res) => {
        try {
            const { id, stadiumStyleId } = req.params;
            console.log(`Received request to delete StadiumStyle with id: ${stadiumStyleId} from Stadium with id: ${id}`);
    
            const stadium = await Stadium.findById(id);
            if (!stadium) {
                console.log(`Stadium with id: ${id} not found`);
                return res.status(404).json("Stadium not found");
            }
    
            const style = stadium.stadium_styles.id(stadiumStyleId);
            if (!style) {
                console.log(`StadiumStyle with id: ${stadiumStyleId} not found`);
                return res.status(404).json("StadiumStyle not found");
            }
    
            console.log(`StadiumStyle found, removing...`);
            stadium.stadium_styles.pull(stadiumStyleId);
    
            console.log(`Saving stadium changes...`);
            await stadium.save();
    
            console.log(`StadiumStyle with id: ${stadiumStyleId} deleted successfully`);
            res.status(200).json("Deleted successfully");
        } catch (err) {
            console.error(`Error occurred: ${err}`);
            res.status(500).json({ error: err.message });
        }
    }
    
    
    
};

module.exports = stadiumController;
