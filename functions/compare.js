const { MongoClient } = require('mongodb')

const { MONGO_URI } = process.env

exports.handler = async function (event) {
  const { municipalities } = event.multiValueQueryStringParameters
  if (municipalities.length < 2) {
    return {
      statusCode: 400,
      body: 'Provide at least two or three municipalities',
    }
  }

  try {
    const client = await MongoClient.connect(MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    const collection = client.db('empower').collection('municipalities')
    const result = await Promise.all(
      municipalities.map(municipality =>
        collection.findOne(
          {
            municipality,
          },
          {
            projection: {
              _id: 0,
            },
          }
        )
      )
    )

    await client.close()

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (err) {
    console.log(err)

    return {
      statusCode: 500,
      body: 'Something went wrong, please try again.',
    }
  }
}
