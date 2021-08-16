import { DynamoDBClient, BatchWriteItemCommand, GetItemCommand, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb"

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
    Key: { id: { N: artist } },
  })
  return client.send(command)
}

export async function putStats(artist: string) {
  const lyrics = (await getSongs(artist)).Items.map(({ lyrics }) => lyrics.S.split(" "))
	
	const wordList = {} as {[word: string]: number}
	
  lyrics.forEach(words => words.forEach(word => {
    if (word in wordList) {
      wordList[word] += 1
    } else {
      wordList[word] = 1
    }
  }))

	const command = new UpdateItemCommand({
		TableName: "rappers",
		Key: { id: { N: artist } },
		UpdateExpression: "set uniques = :u",
		ExpressionAttributeValues: { ":u": { N: Object.keys(wordList).length.toString() } },
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
              image_url: { S: artist.image_url }
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
