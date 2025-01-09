<template>
  <div class="home-view">
    <n-grid :x-gap="24" :y-gap="24" cols="2 s:1 m:2">
      <!-- 统计卡片 -->
      <n-grid-item>
        <n-card title="数据统计">
          <n-grid :cols="2" :x-gap="12" :y-gap="12">
            <n-grid-item>
              <n-statistic label="笔记总数">
                {{ statistics.notesCount }}
              </n-statistic>
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="分类总数">
                {{ statistics.categoriesCount }}
              </n-statistic>
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="标签总数">
                {{ statistics.tagsCount }}
              </n-statistic>
            </n-grid-item>
            <n-grid-item>
              <n-statistic label="今日新增">
                {{ statistics.todayCount }}
              </n-statistic>
            </n-grid-item>
          </n-grid>
        </n-card>
      </n-grid-item>

      <!-- 快速操作 -->
      <n-grid-item>
        <n-card title="快速操作">
          <n-space vertical>
            <n-button
              type="primary"
              block
              @click="$router.push({ name: 'notes' })"
            >
              <template #icon>
                <n-icon><DocumentTextSharp /></n-icon>
              </template>
              写笔记
            </n-button>
            <n-button
              type="info"
              block
              @click="$router.push({ name: 'categories' })"
            >
              <template #icon>
                <n-icon><FolderSharp /></n-icon>
              </template>
              管理分类
            </n-button>
            <n-button
              type="success"
              block
              @click="$router.push({ name: 'tags' })"
            >
              <template #icon>
                <n-icon><PricetagsSharp /></n-icon>
              </template>
              管理标签
            </n-button>
          </n-space>
        </n-card>
      </n-grid-item>

      <!-- 最近笔记 -->
      <n-grid-item span="2">
        <n-card title="最近笔记">
          <n-list>
            <n-list-item v-for="note in recentNotes" :key="note.id">
              <n-thing
                :title="note.title"
                :description="formatDate(note.created_at)"
              >
                <template #avatar>
                  <n-avatar>
                    <n-icon><DocumentTextSharp /></n-icon>
                  </n-avatar>
                </template>
                <template #header-extra>
                  <n-tag :bordered="false" type="info" size="small">
                    {{ note.category?.name || '未分类' }}
                  </n-tag>
                </template>
                <template #description>
                  <n-space size="small">
                    <n-tag
                      v-for="tag in note.tags"
                      :key="tag.id"
                      size="small"
                      :bordered="false"
                    >
                      {{ tag.name }}
                    </n-tag>
                  </n-space>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DocumentTextSharp, FolderSharp, PricetagsSharp } from '@vicons/ionicons5'
import { formatDate } from '../utils/date'

interface Note {
  id: string
  title: string
  content: string
  created_at: string
  category?: {
    id: string
    name: string
  }
  tags: Array<{
    id: string
    name: string
  }>
}

interface Statistics {
  notesCount: number
  categoriesCount: number
  tagsCount: number
  todayCount: number
}

// 统计数据
const statistics = ref<Statistics>({
  notesCount: 0,
  categoriesCount: 0,
  tagsCount: 0,
  todayCount: 0
})

// 最近笔记
const recentNotes = ref<Note[]>([])

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const [notesRes, categoriesRes, tagsRes] = await Promise.all([
      fetch('/api/v1/notes'),
      fetch('/api/v1/categories'),
      fetch('/api/v1/tags')
    ])

    const [notes, categories, tags] = await Promise.all([
      notesRes.json(),
      categoriesRes.json(),
      tagsRes.json()
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    statistics.value = {
      notesCount: notes.data.length,
      categoriesCount: categories.length,
      tagsCount: tags.length,
      todayCount: notes.data.filter((note: Note) => {
        const noteDate = new Date(note.created_at)
        return noteDate >= today
      }).length
    }

    // 获取最近5条笔记
    recentNotes.value = notes.data
      .sort((a: Note, b: Note) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
</style> 