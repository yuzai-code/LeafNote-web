<template>
    <div class="flex">
        <!-- 左侧目录树 -->
        <div class="basis-1/5 w-64 border-r p-4">
            <FolderFree />
        </div>
        <!-- 右侧笔记列表 -->
        <div class="basis-4/5 p-4 flex justify-center">
            <div class="grid gap-4">
                <!-- 笔记卡片 -->
                <div v-for="note in notes" :key="note.id" 
                     class="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                    <div class="card-body">
                        <h2 class="card-title">{{ note.title }}</h2>
                        <p class="text-sm text-base-content/70">{{ note.excerpt }}</p>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-xs text-base-content/50">{{ note.date }}</span>
                            <div class="flex gap-2">
                                <span class="badge badge-primary">{{ note.category }}</span>
                                <span v-for="tag in note.tags" :key="tag" 
                                      class="badge badge-ghost">{{ tag }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
    
<script setup lang='ts'>
import FolderFree from '../compontents/FolderFree.vue'

// 模拟笔记数据
const notes = [
    {
        id: 1,
        title: 'Vue3 组合式 API 学习笔记',
        excerpt: '组合式 API 是 Vue3 中一个重要的新特性，它允许我们使用函数式的方式来组织组件的逻辑...',
        date: '2024-03-15',
        category: '前端开发',
        tags: ['Vue3', 'JavaScript']
    },
    {
        id: 2,
        title: 'Rust 内存管理详解',
        excerpt: 'Rust 的所有权系统是其最独特的特性之一，它保证了内存安全而无需垃圾回收...',
        date: '2024-03-14',
        category: '系统编程',
        tags: ['Rust', '内存管理']
    },
    {
        id: 3,
        title: 'Docker 容器化实践',
        excerpt: '本文记录了在实际项目中使用 Docker 进行应用容器化的经验和最佳实践...',
        date: '2024-03-13',
        category: '运维',
        tags: ['Docker', 'DevOps']
    },
    {
        id: 4,
        title: 'TypeScript 高级类型系统',
        excerpt: 'TypeScript 的类型系统非常强大，本文深入探讨了泛型、映射类型和条件类型等高级特性...',
        date: '2024-03-12',
        category: '编程语言',
        tags: ['TypeScript', '类型系统']
    },
    {
        id: 5,
        title: 'Redis 性能优化技巧',
        excerpt: '通过实际案例分析 Redis 的性能瓶颈，并提供具体的优化方案...',
        date: '2024-03-11',
        category: '数据库',
        tags: ['Redis', '性能优化']
    }
]
</script>
    
<style>
    
</style>