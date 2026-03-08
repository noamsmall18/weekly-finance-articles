import createImageUrlBuilder from '@sanity/image-url'
import {createClient} from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-08'

if (!projectId) {
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable. ' +
      'Set it in your environment to connect to Sanity.',
  )
}

if (!dataset) {
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_DATASET environment variable. ' +
      'Set it in your environment to connect to Sanity.',
  )
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // Set to `false` to disable the edge cache and always hit Sanity directly.
  useCdn: process.env.NODE_ENV === 'production',
})

export const sanityFetch = async (query, params = {}) => {
  return sanityClient.fetch(query, params)
}

const imageBuilder = createImageUrlBuilder({projectId, dataset})

export const urlFor = (source) => imageBuilder.image(source)

