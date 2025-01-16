<template>
        <!-- 搜索框 -->
        <div class="form-control mb-4">
            <input type="text" placeholder="搜索文件夹..." 
                   class="input input-bordered input-sm w-full" />
        </div>
        
        <!-- 目录树 -->
        <div class="space-y-2">
            <template v-for="folder in folders" :key="folder.id">
                <!-- 文件夹项 -->
                <div class="cursor-pointer">
                    <div class="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg"
                         :class="{'pl-[calc(12px*var(--depth,1))]': folder.depth}"
                         :style="{'--depth': folder.depth}">
                        <!-- 展开/折叠图标 -->
                        <svg v-if="folder.children?.length" 
                             class="w-4 h-4 transition-transform"
                             :class="{'rotate-90': folder.expanded}"
                             viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                        <!-- 文件夹图标 -->
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                        </svg>
                        <span class="text-sm">{{ folder.name }}</span>
                    </div>
                </div>
            </template>
        </div>
</template>

<script setup lang="ts">
// 模拟目录树数据
const folders = [
    {
        id: 1,
        name: '我的笔记',
        depth: 0,
        expanded: true,
        children: [
            {
                id: 2,
                name: '前端开发',
                depth: 1,
                expanded: true,
                children: [
                    {
                        id: 3,
                        name: 'Vue',
                        depth: 2,
                        children: []
                    },
                    {
                        id: 4,
                        name: 'React',
                        depth: 2,
                        children: []
                    }
                ]
            },
            {
                id: 5,
                name: '后端开发',
                depth: 1,
                expanded: false,
                children: [
                    {
                        id: 6,
                        name: 'Node.js',
                        depth: 2,
                        children: []
                    },
                    {
                        id: 7,
                        name: 'Python',
                        depth: 2,
                        children: []
                    }
                ]
            }
        ]
    },
    {
        id: 8,
        name: '工作项目',
        depth: 0,
        expanded: false,
        children: [
            {
                id: 9,
                name: '项目文档',
                depth: 1,
                children: []
            },
            {
                id: 10,
                name: '会议记录',
                depth: 1,
                children: []
            }
        ]
    },
    {
        id: 11,
        name: '学习资料',
        depth: 0,
        expanded: false,
        children: [
            {
                id: 12,
                name: '算法笔记',
                depth: 1,
                children: []
            },
            {
                id: 13,
                name: '设计模式',
                depth: 1,
                children: []
            }
        ]
    }
]
</script>

<style scoped>
/* 可以添加一些过渡动画效果 */
.transition-transform {
    transition: transform 0.2s ease-in-out;
}
</style>