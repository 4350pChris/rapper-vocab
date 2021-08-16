import {
  DynamoDBClient,
  BatchWriteItemCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb"

const client = new DynamoDBClient({
  region: "eu-central-1",
  endpoint: import.meta.env.DEV ? "http://localhost:8000" : undefined,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  }
})

export async function getArtist(artist: string) {
  const command = new GetItemCommand({
    TableName: "rappers",
    Key: { id: { N: artist } }
  })
  return client.send(command)
}

export async function putStats(artist: string) {
  const lyrics = (await getSongs(artist)).Items.map(({ lyrics }) =>
    lyrics.S.split(" ").filter((val) => val.length > 0)
  )

  const wordList = {} as { [word: string]: number }
  let count = 0

  lyrics.forEach((words) =>
    words.forEach((word) => {
      count += 1
      if (word in wordList) {
        wordList[word] += 1
      } else {
        wordList[word] = 1
      }
    })
  )

  const topHundred = Object.entries(wordList)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([word, val]) => [word, { N: val.toString() }])

  const command = new UpdateItemCommand({
    TableName: "rappers",
    Key: { id: { N: artist } },
    UpdateExpression: "set stats.uniques = :u, stats.words = :w, stats.top = :t",
    ExpressionAttributeValues: {
      ":u": { N: Object.keys(wordList).length.toString() },
      ":w": { N: count.toString() },
      ":t": { M: Object.fromEntries(topHundred) }
    },
    ReturnValues: "UPDATED_NEW"
  })
  return client.send(command)
}

export async function getSongs(artist: string) {
  const command = new QueryCommand({
    TableName: "songs",
    KeyConditionExpression: "#artist = :artist",
    ExpressionAttributeNames: { "#artist": "artistId" },
    ExpressionAttributeValues: { ":artist": { N: artist } }
  })
  return client.send(command)
}

export async function putSongs(songs: Record<string, any>[]) {
  const artist: Record<string, any> = songs[0].primary_artist
  const command = new BatchWriteItemCommand({
    RequestItems: {
      rappers: [
        {
          PutRequest: {
            Item: {
              id: { N: artist.id.toString() },
              name: { S: artist.name },
              image_url: { S: artist.image_url },
              stats: {
                M: {
                  words: { N: "0" }
                }
              }
            }
          }
        }
      ],
      songs: songs.map((song) => ({
        PutRequest: {
          Item: {
            id: { N: song.id.toString() },
            artistId: { N: song.primary_artist.id.toString() },
            title: { S: song.title },
            lyrics: { S: song.lyrics }
          }
        }
      }))
    }
  })
  return client.send(command)
}
