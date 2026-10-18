import type { Collection } from "tinacms";

const linkFields = [
  { name: "title", label: "Link Label", type: "string" },
  { name: "link", label: "Link URL", type: "string" },
];

export const GlobalConfigCollection: Collection = {
  name: "config",
  label: "Global Config",
  path: "src/content/config",
  format: "json",
  ui: {
    global: true,
  },
  fields: [
    {
      name: "headerNavigation",
      label: "Header Navigation",
      type: "reference",
      collections: ["navigation"],
      description: "Choose the Navigation document used in the site header.",
    },
    {
      name: "footerNavigation",
      label: "Footer Navigation",
      type: "reference",
      collections: ["navigation"],
      description: "Choose the Navigation document used in the site footer.",
    },
    {
      name: "favicon",
      label: "Favicon",
      type: "image",
      description: "Legacy top-level favicon field kept for TinaCloud schema compatibility. Prefer Site Identity & SEO → Favicon for editing.",
    },
    {
      name: "seo",
      label: "Site Identity & SEO",
      type: "object",
      fields: [
        { name: "title", label: "Site Name", type: "string" },
        { name: "description", label: "Default Meta Description", type: "string", ui: { component: "textarea" } },
        { name: "siteOwner", label: "Site Owner", type: "string" },
        { name: "logo", label: "Logo", type: "image" },
        {
          name: "favicon",
          label: "Favicon",
          type: "image",
          description: "Upload the browser tab/site icon. Recommended: square PNG, SVG, or ICO.",
        },
        {
          name: "footerLogo",
          label: "Footer Logo",
          type: "image",
          description: "Upload the logo used in the footer. Falls back to the header logo when empty.",
        },
      ],
    },
    {
      name: "globalText",
      label: "Global Display Text",
      type: "object",
      fields: [
        { name: "ctaHeading", label: "CTA Heading", type: "string" },
        { name: "ctaButtonText", label: "CTA Button Text", type: "string" },
        { name: "ctaButtonLink", label: "CTA Button Link", type: "string" },
        { name: "footerTagline", label: "Footer Tagline", type: "string" },
        { name: "copyrightSuffix", label: "Copyright Suffix", type: "string" },
      ],
    },
    {
      name: "articleSettings",
      label: "Article Sidebar",
      type: "object",
      fields: [
        { name: "standardsEyebrow", label: "Standards Eyebrow", type: "string" },
        { name: "standardsTitle", label: "Standards Title", type: "string" },
        { name: "standardsText", label: "Standards Text", type: "string", ui: { component: "textarea" } },
        { name: "standardsButtonText", label: "Standards Button Text", type: "string" },
        { name: "standardsButtonLink", label: "Standards Button Link", type: "string" },
      ],
    },
    {
      name: "systemPages",
      label: "System Pages",
      type: "object",
      fields: [
        {
          name: "notFound",
          label: "404 Page",
          type: "object",
          fields: [
            { name: "metaTitle", label: "Meta Title", type: "string" },
            { name: "metaDescription", label: "Meta Description", type: "string", ui: { component: "textarea" } },
            { name: "code", label: "Error Code", type: "string" },
            { name: "heading", label: "Heading", type: "string" },
            { name: "message", label: "Message", type: "string", ui: { component: "textarea" } },
            { name: "buttonText", label: "Button Text", type: "string" },
            { name: "buttonLink", label: "Button Link", type: "string" },
          ],
        },
        {
          name: "sitemap",
          label: "Sitemap Page",
          type: "object",
          fields: [
            { name: "metaTitle", label: "Meta Title", type: "string" },
            { name: "metaDescription", label: "Meta Description", type: "string", ui: { component: "textarea" } },
            { name: "heading", label: "Heading", type: "string" },
            { name: "pagesHeading", label: "Pages Heading", type: "string" },
            { name: "postsHeading", label: "Posts Heading", type: "string" },
            { name: "emptyPagesText", label: "Empty Pages Text", type: "string" },
            { name: "emptyPostsText", label: "Empty Posts Text", type: "string" },
            { name: "fallbackPageTitle", label: "Fallback Page Title", type: "string" },
            { name: "fallbackPostTitle", label: "Fallback Post Title", type: "string" },
          ],
        },
      ],
    },
    {
      name: "contactForm",
      label: "Contact Form",
      type: "object",
      fields: [
        { name: "formspreeEndpoint", label: "Formspree Endpoint URL", type: "string" },
        { name: "heading", label: "Heading", type: "string" },
        { name: "description", label: "Description", type: "string", ui: { component: "textarea" } },
        { name: "buttonText", label: "Button Text", type: "string" },
        { name: "note", label: "Form Note", type: "string", ui: { component: "textarea" } },
        { name: "subject", label: "Email Subject", type: "string" },
      ],
    },
    {
      name: "codeInjection",
      label: "Code Injection",
      type: "object",
      fields: [
        { name: "headerCode", label: "Header Code", type: "string", ui: { component: "textarea" } },
        { name: "footerCode", label: "Footer Code", type: "string", ui: { component: "textarea" } },
      ],
    },
    {
      name: "contactLinks",
      label: "Contact Links",
      type: "object",
      list: true,
      ui: { itemProps: (item) => ({ label: item.title }) },
      fields: [
        { name: "title", label: "Title", type: "string" },
        { name: "link", label: "Link", type: "string" },
        { name: "icon", label: "Icon", type: "string" },
      ],
    },
    {
      name: "footerStarfield",
      label: "Show starfield in footer",
      type: "boolean",
    },
  ],
};
