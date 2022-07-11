<template>
	<div class="complete-container">
		<span class="complete" :class="!isValid ? 'unvalid' : null">
			<div class="text-slot-area" :class="!isValid ? 'unvalid' : null">
				<slot></slot>
			</div>
			<img
				src="@/assets/svg/search-delete.svg"
				alt="delete"
				class="delete-btn"
				@click="onClickDeleteBtn"
			/>
		</span>
	</div>
</template>

<script>
export default {
	name: 'CompleteText',
	props: {
		keyValue: {
			type: Number,
			required: true,
		},
	},
	data() {
		return {
			isValid: false,
		}
	},
	methods: {
		getValue() {
			return this.$slots.default[0].text.trim()
		},
		getIsValid() {
			return this.isValid
		},
		setIsValid(isValid) {
			this.isValid = isValid
		},
		onClickDeleteBtn() {
			this.$emit('delete', this.keyValue)
		},
	},
}
</script>

<style lang="scss" scoped>
@import '@/styles/scss/global/_common.scss';

.complete-container {
	display: inlin-block;
	.complete {
		display: inline-flex;
		align-items: center;
		background-color: #fff;
		border: 1px solid #dddddd;
		border-radius: 14px;
		box-sizing: border-box;
		max-width: 437px;
		height: 28px;
		margin: 4px 6px;
		padding: 2px 2px 2px 8px;
		.text-slot-area {
			display: inline-block;
			overflow: hidden;
			text-overflow: ellipsis;
			font-size: 12px;
			box-sizing: border-box;
			cursor: default;
			font-weight: 400;
			margin: 0;
			line-height: 18px;
		}
		.text-slot-area.unvalid {
			color: #ff5746;
		}
		.delete-btn {
			display: inline-block;
			vertical-align: top;
			cursor: pointer;
			height: 24px;
			width: 24px;
		}
	}
	.complete.unvalid {
		background: rgba(255, 87, 70, 0.05);
		border: 1px solid #ff5746;
	}
}
</style>
