import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'category',
  title: 'أقسام المنيو',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'اسم القسم',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'الرابط البرمجي للقسم (Slug)',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'orderAsc',
      title: 'ترتيب الظهور',
      type: 'number',
      description: 'أدخل رقماً لترتيب الأقسام (مثلاً: 1 للمشويات، 2 للمقبلات...)'
    })
  ]
})