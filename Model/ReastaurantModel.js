const mongoose=require('mongoose')
const ObjectId=mongoose.Schema.Types.ObjectId

const RestaurantSchema=new mongoose.Schema({

   title:{
    type:String,
    require:[true,"title is requireed"]
   } ,
   imeageURL:{

    type:String
   } ,
  foods: [{
    Dish_Name: { type: String, required: true },
    Dish_Pick: { type: String },
    Price: { type: Number, required: true },
    Quantity: { type: Number, required: true },
    Category: {
        type: String,
        required: true,
        default: "Meal",
        enum: {
            values: ["Snaks", "Meal", "Breakfast"],
            message: "Category must be either 'Snaks', 'Meal', or 'Breakfast'."
        }
    }
}]

  
    ,
   TimeRanges:{
    type :String
   } ,
   pickup:{type:Boolean,default:true},
   delivery:{type:Boolean,default:true},
   isOpen:{type:Boolean,default:true},
   logoURL:{type:String},
   rating:{type:Number,min:1,max:5},
   ratingCount:{type:Number},
   code:{type:String},
   coords:{
    id:{type:String},
    latitude:{type:Number},
    latitudeDelta:{type:Number},
    longitude:{type:Number},
    logitudeDelta:{type:Number},
    address:{type:String},
    title:{type:String}
   },
   OwnerId:{
    type:mongoose.Schema.Types.ObjectId,ref:'User',require:true
   }
/*,
   CategoryId:{
    type:ObjectId,ref:User
   }
*/

},{timestamps:true})
module.exports = mongoose.model('Restaurant', RestaurantSchema);