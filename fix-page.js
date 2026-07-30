const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/portal/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import
if (!content.includes('import GlassCard')) {
  content = content.replace("import SkeletonCard from '@/components/ui/SkeletonCard'", "import SkeletonCard from '@/components/ui/SkeletonCard'\nimport GlassCard from '@/components/ui/GlassCard'");
}

// Replace the hardcoded glass classes with <GlassCard interactive>
// The regex finds the div that starts with className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]
const oldClasses = 'bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col justify-between min-h-[160px]';

// For the metric cards
content = content.replaceAll(
  `<div className="${oldClasses}">`,
  `<GlassCard interactive className="p-8 flex flex-col justify-between min-h-[160px]">`
);
content = content.replaceAll(
  `</div>\n\n        {/* Completed */}`,
  `</GlassCard>\n\n        {/* Completed */}`
);
content = content.replaceAll(
  `</div>\n\n        {/* Active Notices */}`,
  `</GlassCard>\n\n        {/* Active Notices */}`
);
content = content.replaceAll(
  `</div>\n\n        {/* Progress Ring */}`,
  `</GlassCard>\n\n        {/* Progress Ring */}`
);
content = content.replaceAll(
  `</div>\n      </div>\n\n      {/* ── Progress Bar ── */}`,
  `</GlassCard>\n      </div>\n\n      {/* ── Progress Bar ── */}`
);


// For the progress bar
const oldProgClass = 'bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none mt-8';
content = content.replaceAll(
  `<div className="${oldProgClass}">`,
  `<GlassCard className="p-8 mt-8">`
);

content = content.replaceAll(
  `</p>\n        </div>\n      )}`,
  `</p>\n        </GlassCard>\n      )}`
);

// For Noticeboard wrapper
const oldNoticeWrapper = 'bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none mt-8 overflow-hidden';
content = content.replaceAll(
  `<div className="${oldNoticeWrapper}">`,
  `<GlassCard className="mt-8 overflow-hidden !p-0">`
);

content = content.replaceAll(
  `</div>\n        </div>\n      </div>`,
  `</div>\n        </div>\n      </GlassCard>`
);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Done refactoring app/portal/page.tsx');
