export interface TagDto {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface CreateTagRequestDto {
  name: string
  color: string
}

export interface UpdateTagRequestDto {
  name: string
  color: string
}

export interface CreateTagRequest {
  name: string
  color: string
}

export interface UpdateTagRequest {
  name: string
  color: string
}

export interface TagColor {
  fill: string
  ink: string
  edge: string
  inkContrast: number
  fillVsGround: number
  edgeVsGround: number
  aa: boolean
  usedFallback: boolean
}
