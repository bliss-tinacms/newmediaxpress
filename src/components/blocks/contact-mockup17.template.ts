export const contactMockup17BlockSchema = {
  name: 'contactMockup17',
  label: 'Contact Page Template Sections',
  fields: [
    {
      type: 'object',
      name: 'hero',
      label: 'Hero Section',
      fields: [
        { name: 'breadcrumbHome', label: 'Breadcrumb Home Label', type: 'string' },
        { name: 'breadcrumbHomeLink', label: 'Breadcrumb Home Link', type: 'string' },
        { name: 'breadcrumbSeparator', label: 'Breadcrumb Separator', type: 'string' },
        { name: 'breadcrumbCurrent', label: 'Current Page Breadcrumb', type: 'string' },
        { name: 'headlineLead', label: 'Headline', type: 'string' },
        { name: 'headlineAccent', label: 'Headline Accent', type: 'string' },
        { name: 'lede', label: 'Lede', type: 'string', ui: { component: 'textarea' } },
      ],
    },
    {
      type: 'object',
      name: 'formSection',
      label: 'Message Form Section',
      fields: [
        { name: 'eyebrow', label: 'Eyebrow', type: 'string' },
        { name: 'title', label: 'Title', type: 'string' },
        { name: 'nameLabel', label: 'Name Field Label', type: 'string' },
        { name: 'phoneLabel', label: 'Phone Field Label', type: 'string' },
        { name: 'emailLabel', label: 'Email Field Label', type: 'string' },
        { name: 'messageLabel', label: 'Message Field Label', type: 'string' },
        { name: 'buttonText', label: 'Button Text', type: 'string' },
        { name: 'note', label: 'Form Note', type: 'string', ui: { component: 'textarea' } },
        { name: 'formAction', label: 'Form Action URL / Formspree Endpoint', type: 'string', description: 'Optional page override. When blank, the endpoint comes dynamically from Global Config.' },
        { name: 'subject', label: 'Email Subject', type: 'string' },
      ],
    },
    {
      type: 'object',
      name: 'inboxes',
      label: 'Inbox Cards',
      fields: [
        {
          name: 'cards',
          label: 'Inbox Cards',
          type: 'object',
          list: true,
          fields: [
            { name: 'title', label: 'Title', type: 'string' },
            { name: 'description', label: 'Description', type: 'string', ui: { component: 'textarea' } },
            { name: 'email', label: 'Email', type: 'string' },
            { name: 'note', label: 'Note', type: 'string', ui: { component: 'textarea' } },
          ],
        },
      ],
    },
    {
      type: 'object',
      name: 'requests',
      label: 'Specific Requests Section',
      fields: [
        {
          name: 'cards',
          label: 'Request Cards',
          type: 'object',
          list: true,
          fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'title', label: 'Title', type: 'string' },
            { name: 'text', label: 'Text', type: 'string', ui: { component: 'textarea' } },
          ],
        },
      ],
    },
  ],
};
