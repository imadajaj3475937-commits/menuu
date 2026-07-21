import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'foodItem',
  title: 'الأطباق والمأكولات',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'اسم الطبق',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'وصف الطبق والمكونات باختصار',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'price',
      title: 'السعر (بالدينار العراقي مثلاً)',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    }),
    defineField({
      name: 'image',
      title: 'صورة الطبق',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'القسم التابع له',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'badge',
      title: 'شارة خاصة بالطبق (Badge)',
      type: 'string',
      options: {
        list: [
          { title: 'بدون شارة', value: '' },
          { title: 'جديد ✨', value: 'new' },
          { title: 'حار 🔥', value: 'hot' },
          { title: 'سبايسي 🌶️', value: 'spicy' },
          { title: 'الأكثر طلباً ⭐', value: 'best' }
        ]
      }
    }),
    defineField({
      name: 'availability',
      title: 'متوفر حالياً؟',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'ingredients',
      title: 'المكونات بالتفصيل (تظهر في النافذة المنبثقة)',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'calories',
      title: 'عدد السعرات الحرارية',
      type: 'number'
    }),
    defineField({
      name: 'protein',
      title: 'كمية البروتين (بالغرام)',
      type: 'number'
    })
  ]
})