<template>
  <div class="p-4 max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 统计卡片 -->
      <div class="card bg-base-100">
        <div class="card-body">
          <h2 class="card-title">数据统计</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title">笔记总数</div>
                <div class="stat-value">{{ statistics.notesCount }}</div>
              </div>
            </div>
            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title">分类总数</div>
                <div class="stat-value">{{ statistics.categoriesCount }}</div>
              </div>
            </div>
            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title">标签总数</div>
                <div class="stat-value">{{ statistics.tagsCount }}</div>
              </div>
            </div>
            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title">今日新增</div>
                <div class="stat-value">{{ statistics.todayCount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="card bg-base-100">
        <div class="card-body">
          <h2 class="card-title">快速操作</h2>
          <div class="flex flex-col gap-4">
            <button class="btn btn-primary" @click="$router.push({ name: 'notes' })">
              <notes theme="outline" size="20" />
              写笔记
            </button>
            <button class="btn btn-info" @click="$router.push({ name: 'categories' })">
              <folder theme="outline" size="20" />
              管理分类
            </button>
            <button class="btn btn-success" @click="$router.push({ name: 'tags' })">
              <tag-one theme="outline" size="20" />
              管理标签
            </button>
          </div>
        </div>
      </div>

      <!-- 最近笔记 -->
      <div class="card bg-base-100 md:col-span-2">
        <div class="card-body">
          <h2 class="card-title">最近笔记</h2>
          <div class="overflow-x-auto">
            <table class="table">
              <tbody>
                <tr v-for="note in recentNotes" :key="note.id" class="hover">
                  <td>
                    <div class="flex items-center space-x-3">
                      <div class="avatar">
                        <div
                          class="mask mask-squircle w-12 h-12 bg-base-200 flex items-center justify-center"
                        >
                          <notes theme="outline" size="24" />
                        </div>
                      </div>
                      <div>
                        <div class="font-bold">{{ note.title }}</div>
                        <div class="text-sm opacity-50">
                          {{ formatDate(note.created_at) }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="badge badge-ghost">
                      {{ note.category?.name || "未分类" }}
                    </div>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <div
                        v-for="tag in note.tags"
                        :key="tag.id"
                        class="badge badge-outline"
                      >
                        {{ tag.name }}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Notes, Folder, TagOne } from "@icon-park/vue-next";
import { formatDate } from "../utils/date";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
}

interface Statistics {
  notesCount: number;
  categoriesCount: number;
  tagsCount: number;
  todayCount: number;
}

// 统计数据
const statistics = ref<Statistics>({
  notesCount: 0,
  categoriesCount: 0,
  tagsCount: 0,
  todayCount: 0,
});

// 最近笔记
const recentNotes = ref<Note[]>([]);

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const [notesRes, categoriesRes, tagsRes] = await Promise.all([
      fetch("/api/v1/notes"),
      fetch("/api/v1/categories"),
      fetch("/api/v1/tags"),
    ]);

    const [notes, categories, tags] = await Promise.all([
      notesRes.json(),
      categoriesRes.json(),
      tagsRes.json(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    statistics.value = {
      notesCount: notes.data.length,
      categoriesCount: categories.length,
      tagsCount: tags.length,
      todayCount: notes.data.filter((note: Note) => {
        const noteDate = new Date(note.created_at);
        return noteDate >= today;
      }).length,
    };

    // 获取最近5条笔记
    recentNotes.value = notes.data
      .sort(
        (a: Note, b: Note) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  } catch (error) {
    console.error("获取统计数据失败:", error);
  }
};

onMounted(() => {
  fetchStatistics();
});
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
</style>
