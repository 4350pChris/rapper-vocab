import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb"

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: "eu-central-1",
    endpoint: import.meta.env.DEV ? "http://localhost:8000" : undefined,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
    }
  })
)

export async function getArtist(artist: number) {
  const command = new GetCommand({
    TableName: "rappers",
    Key: { id: artist }
  })
  return client.send(command)
}

export async function putStats(artist: number) {
  const { Items: items } = await getSongs(artist)
  const lyrics = items.map(({ lyrics }) => lyrics.split(" ").filter((val) => val.length > 0))

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

  const sorted = Object.entries(wordList).sort((a, b) => b[1] - a[1])

  const topHundred = sorted.slice(0, 100)

  const avgLength = sorted.reduce((acc, [word]) => acc + word.length, 0) / sorted.length

  const calcMedian = () => {
    const middle = Math.floor(sorted.length / 2)
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1][0].length + sorted[middle][0].length) / 2
    }
    return sorted[middle][0].length
  }

  const medianLength = calcMedian()

  const command = new UpdateCommand({
    TableName: "rappers",
    Key: { id: artist },
    UpdateExpression:
      "set stats.uniques = :u, stats.words = :w, stats.top = :t, stats.average = :a, stats.median = :m",
    ExpressionAttributeValues: {
      ":u": Object.keys(wordList).length,
      ":w": count,
      ":t": Object.fromEntries(topHundred),
      ":a": avgLength,
      ":m": medianLength
    },
    ReturnValues: "UPDATED_NEW"
  })
  return client.send(command)
}

export async function getSongs(artist: number) {
  const command = new QueryCommand({
    TableName: "songs",
    KeyConditionExpression: "#artist = :artist",
    ExpressionAttributeNames: { "#artist": "artistId" },
    ExpressionAttributeValues: { ":artist": artist }
  })
  return client.send(command)
}

export async function putSongs(songs: Record<string, any>[]) {
  const artist: Record<string, any> = songs[0].primary_artist
  const command = new BatchWriteCommand({
    RequestItems: {
      rappers: [
        {
          PutRequest: {
            Item: {
              id: artist.id,
              name: artist.name,
              image_url: artist.image_url,
              stats: {}
            }
          }
        }
      ],
      songs: songs.map((song) => ({
        PutRequest: {
          Item: {
            id: song.id,
            artistId: song.primary_artist.id,
            title: song.title,
            lyrics: song.lyrics
          }
        }
      }))
    }
  })
  return client.send(command)
}
