export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 try{
  const r=await fetch("https://hardware-api-calls.onrender.com/api/gethardware-data");
  const text=await r.text();
  res.status(r.status);
  res.setHeader("Content-Type",r.headers.get("content-type")||"application/json");
  return res.send(text);
 }catch(e){return res.status(502).json({error:"Unable to reach hardware API",details:e.message});}
}