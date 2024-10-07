import { Message } from "../models"

const clearChat = async(receiverId, senderId)=>{
     const deletedMsg = await Message.deleteMany()
}