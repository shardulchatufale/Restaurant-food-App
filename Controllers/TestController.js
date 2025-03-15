const TestControllerUser=(req,res)=>{
    try{
     res.status(200).send({successstatus:true,message:"geted"})
    }catch(error){
console.log(error);
    }
}
module.exports={TestControllerUser}