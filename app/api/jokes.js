const { PrismaClient } = require('@prisma/client');


const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}


const handler = async (req, res) => {

  if (req.method === 'GET') {

    const prisma = new PrismaClient();

    try {
      const jokes = await prisma.joke.findMany();
      await prisma.$disconnect();
      res.json(jokes)
    } catch (error) {
      console.log(error)
      return res.status(500).send('internal server error')
    }

  }

  if (req.method === 'POST') {
    const prisma = new PrismaClient();

    const data = [...req.body]
    try {
      await prisma.joke.createMany({
        data: data
      })
    } catch (error) {
      console.log(error)
      return res.status(500).send('internal server error')
    }

    await prisma.$disconnect();

    return res.json({
      "message": "jokes added successfully"
    });

  }
  else {
    console.log(404)
  }
}



module.exports = allowCors(handler)