import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'restaurantSettings',
  title: 'إعدادات المطعم',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'اسم المطعم',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'وصف قصير عن المطعم',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'logo',
      title: 'شعار المطعم (Logo)',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'coverImage',
      title: 'صورة الغلاف (Hero Cover)',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'phone',
      title: 'رقم الهاتف للاتصال',
      type: 'string'
    }),
    defineField({
      name: 'whatsapp',
      title: 'رقم الواتساب (مع رمز الدولة بدون + مثل: 9647500000000)',
      type: 'string'
    }),
    defineField({
      name: 'address',
      title: 'عنوان المطعم',
      type: 'string'
    }),
    defineField({
      name: 'facebook',
      title: 'رابط صفحة الفيسبوك',
      type: 'url'
    }),
    defineField({
      name: 'instagram',
      title: 'رابط حساب الإنستغرام',
      type: 'url'
    }),
    defineField({
      name: 'workHours',
      title: 'ساعات العمل',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'مثال: طيلة أيام الأسبوع من 12 ظهراً حتى 12 ليلاً'
    })
  ]
})