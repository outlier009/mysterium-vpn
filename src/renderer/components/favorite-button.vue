<!--
  - Copyright (C) 2018 The "mysteriumnetwork/mysterium-vpn" Authors.
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU General Public License for more details.
  -
  - You should have received a copy of the GNU General Public License
  - along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<template>
  <div class="favorite-button">
    <div
      class="favorite-button__icon"
      v-bind="country"
      @click="toggleFavorite(country)"
      v-text="buttonText"/>
  </div>
</template>

<script>

export default {
  name: 'FavoriteButton',
  computed: {
    buttonText () { return this.country && this.country.isFavorite ? '★' : '☆' }
  },
  props: {
    country: {
      type: [Object],
      default: () => { return { isFavorite: false } }
    },
    toggleFavorite: {
      type: Function,
      required: true
    }
  }
}
</script>
