<template>
	<div class="email-text-area-container">
		<div class="top">
			<div class="title-text" @click="getEmailList">{{ tt(title) }}</div>
			<div
				class="delete-text"
				:style="{ color: isEmptyEmailList ? '#999999' : null }"
				@click="onClickClearMailList"
			>
				{{ tt('모두 지우기') }}
			</div>
		</div>
		<div
			class="contents"
			:class="{ error: isError }"
			:style="{
				minHeight: `${contentMinHeight}px`,
			}"
			@click="onClickContentsArea"
		>
			<complete-text
				v-for="(completedEmail, index) of completedEmailList"
				:key="index"
				ref="completedEmailText"
				:keyValue="completedEmail.key"
				@delete="onDeleteCompleteEmail"
				>{{ completedEmail.value }}
			</complete-text>
			<textarea
				class="email-textarea"
				wrap="off"
				autofocus
				:placeholder="
					completedEmailList.length === 0 ? tt(placeholder) : null
				"
				@keypress="onKeyPressTextArea"
				@keydown="onKeydownTextArea"
				@input="onInputTextArea"
			></textarea>
		</div>
		<div class="bottom">
			<template v-if="!isNotEmptyEmailList">
				<div class="error-text-area">
					<img src="@/assets/svg/Error1.svg" alt="error" />
					<span class="error-text">
						{{ tt('이메일을 입력해주세요') }}
					</span>
				</div>
			</template>
			<template v-if="!isValidEmailList">
				<div class="error-text-area">
					<img src="@/assets/svg/Error1.svg" alt="error" />
					<span class="error-text">
						{{ tt('유효한 이메일을 입력해주세요') }}
					</span>
				</div>
			</template>
			<template v-if="!isUnderMaxSize">
				<div class="error-text-area">
					<img src="@/assets/svg/Error1.svg" alt="error" />
					<span class="error-text">
						{{
							tt('이메일 초대는 한번에 최대 30개까지 가능합니다')
						}}
					</span>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import CompleteText from '@/views/institute/member/components/CompleteText.vue'

export default {
	name: 'EmailTextArea',
	components: {
		CompleteText,
	},
	props: {
		title: {
			type: String,
			default: '이메일로 초대하기',
		},
		placeholder: {
			type: String,
			default:
				'예: abc@abc.com, abc@smartjackwp.com\n(쉼표, 엔터키, 스페이스바를 눌러 이메일 주소를 추가하세요)',
		},
		width: {
			type: Number,
			default: 0,
		},
		contentMinHeight: {
			type: Number,
			default: 150,
		},
		contentMaxHeight: {
			type: Number,
			default: 0,
		},
	},
	data() {
		return {
			completedEmailList: [],
			completedEmailIndex: 0,
			isNotEmptyEmailList: true,
			isValidEmailList: true,
			isUnderMaxSize: true,
		}
	},
	watch: {
		completedEmailList() {
			document.querySelector('.email-textarea').style.width =
				this.completedEmailList.length === 0 ? '100%' : '70px'

			this.$nextTick(() => {
				this.$refs.completedEmailText?.forEach(component => {
					component.setIsValid(
						this.validateEmail(component.getValue()) &&
							!this.isDuplicate(component.getValue())
					)
				})
			})
		},
	},
	computed: {
		isError() {
			return (
				!this.isNotEmptyEmailList ||
				!this.isValidEmailList ||
				!this.isUnderMaxSize
			)
		},
		isEmptyEmailList() {
			return this.completedEmailList.length === 0
		},
		emailList() {
			return this.completedEmailList.map(
				completedEmail => completedEmail.value
			)
		},
	},
	mounted() {
		if (this.width > 0) {
			const containerEl = document.querySelector(
				'.email-text-area-container'
			)
			containerEl.style.width = `${this.width}px`
		}
		if (this.contentMaxHeight > 0) {
			const contentsEl = document.querySelector('.contents')
			contentsEl.style.maxHeight = `${this.contentMaxHeight}px`
			contentsEl.style.overflowX = 'hidden'
		}
	},
	methods: {
		validateEmail(email) {
			const regex =
				/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			return regex.test(email)
		},
		isDuplicate(value) {
			let duplicateCount = 0
			let index = this.emailList.indexOf(value)
			while (index != -1) {
				duplicateCount++
				index = this.emailList.indexOf(value, index + 1)
			}
			return duplicateCount > 1 ? true : false
		},
		getEmailList() {
			this.isNotEmptyEmailList = this.completedEmailList.length > 0
			this.isUnderMaxSize = this.completedEmailList.length <= 30
			this.isValidEmailList = this.$refs.completedEmailText
				? this.$refs.completedEmailText.every(component =>
						component.getIsValid()
				  )
				: true
			return this.isError ? [] : this.emailList
		},
		onClickClearMailList() {
			this.clearMailList()
		},
		clearMailList() {
			this.completedEmailList = []
		},
		onClickContentsArea() {
			document.querySelector('.email-textarea').focus()
		},
		onKeyPressTextArea(e) {
			// vue 한글 입력 시 keydown 두번 호출 되는 버그 있어서 분리
			if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
				e.preventDefault()
				if (e.target.value) {
					this.completedEmailList.push({
						key: ++this.completedEmailIndex,
						value: e.target.value,
					})
					e.target.value = ''
				}
			}
		},
		onKeydownTextArea(e) {
			if (e.key === 'Backspace')
				if (!e.target.value) this.completedEmailList.pop()
		},
		onInputTextArea(e) {
			this.autoResizeTextArea(e.target.scrollWidth)
		},
		autoResizeTextArea(resizeWidth) {
			document.querySelector(
				'.email-textarea'
			).style.width = `${resizeWidth}px`
		},
		onDeleteCompleteEmail(key) {
			this.completedEmailList.some((completedEmail, index) => {
				if (completedEmail.key === key) {
					this.completedEmailList.splice(index, 1)
					return true
				} else {
					return false
				}
			})
		},
	},
}
</script>

<style lang="scss" scoped>
@import '@/styles/scss/global/_common.scss';

.email-text-area-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	.top {
		display: flex;
		justify-content: space-between;
		width: 100%;
		.title-text {
			font-style: normal;
			font-weight: 700;
			font-size: 12px;
		}
		.delete-text {
			font-style: normal;
			font-weight: 700;
			font-size: 12px;
			color: #0b6cff;
			cursor: pointer;
		}
	}
	.contents {
		display: flex;
		flex-wrap: wrap;
		cursor: text;
		border: 1px solid #ccc;
		width: 100%;
		height: 100%;
		padding: 4px;
		margin: 8px 0;
		align-items: stretch;
		align-content: flex-start;
		border-radius: 5px;
		&:focus-within {
			border-color: #000;
		}
		&.error {
			border-color: #ff5746;
		}
		.email-textarea {
			text-align: left;
			overflow: hidden;
			outline: none;
			resize: none;
			border: 0;
			margin: 9px 0 0 15px;
			padding: 0;
			box-shadow: none;
			width: 100%;
			min-width: 50px;
			font-size: 12px;
		}
	}
	.bottom {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		width: 100%;
		.error-text-area {
			display: flex;
			align-items: center;
			.error-text {
				color: #ff5746;
				font-size: 12px;
				font-weight: 400;
			}
		}
	}
}
</style>
