<template>
  <q-item clickable @click="handleClick">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "EssentialLink",

  props: {
    title: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: "",
    },

    link: {
      type: String,
      default: "",
    },

    icon: {
      type: String,
      default: "",
    },

    action: {
      type: Function,
      default: null,
    },
  },

  setup(props) {
    const router = useRouter()

    const handleClick = () => {

      if (props.action) {
        props.action()
        return
      }

      if (props.link) {
        router.push(props.link)
      }
    }

    return {
      handleClick
    }
  }
});
</script>
