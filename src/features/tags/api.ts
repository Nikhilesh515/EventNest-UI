import { apiClient } from '@/api/client'
import { TAGS } from '@/api/endpoints'
import type { CreateTagRequest, TagDto, UpdateTagRequest } from '@/types'

export async function listTags(signal?: AbortSignal): Promise<TagDto[]> {
  const { data } = await apiClient.get<TagDto[]>(TAGS.list, { signal })
  return data
}

export async function getTag(id: string): Promise<TagDto> {
  const { data } = await apiClient.get<TagDto>(TAGS.byId(id))
  return data
}

export async function createTag(body: CreateTagRequest): Promise<TagDto> {
  const { data } = await apiClient.post<TagDto>(TAGS.create, body)
  return data
}

export async function updateTag(id: string, body: UpdateTagRequest): Promise<TagDto> {
  const { data } = await apiClient.put<TagDto>(TAGS.byId(id), body)
  return data
}

export async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(TAGS.byId(id))
}
