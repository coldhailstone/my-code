<template>
	<div class="Modal ModalPrintLabel Popup__depth3" v-if="isShow">
		<div class="Popup__background"></div>
		<div class="Popup__container Popup__size-sm">
			<div class="Popup__top">
				<h5 class="Popup__title">{{ tt(`라벨 ${type}`) }}</h5>
				<button class="Popup__close-btn" @click="hide">
					<img src="@/assets/svg/popup-close.svg" alt="close" />
				</button>
			</div>
			<div class="Popup__content">
				<p class="Popup__plain-text">
					용기 또는 포장의 용량에 따른 인쇄의 크기
				</p>
				<div class="input-wrap">
					<label
						v-for="(labelName, index) of label.names"
						:key="index"
					>
						<input
							v-model="labelSize"
							type="radio"
							name="size"
							:value="label.values[index]"
						/>
						<b>{{ labelName }}</b>
						<span>{{ label.sizes[index] }}</span>
					</label>
				</div>
			</div>
			<div class="Popup__bottom">
				<div class="Popup__btn-group">
					<button class="Btn__close" @click="hide">
						{{ tt('취소') }}
					</button>
					<button class="Btn__edit" @click="onClickEventBtn">
						{{ tt(type) }}
					</button>
				</div>
			</div>
		</div>
		<div id="exportDiv" style="visibility: hidden"></div>
	</div>
</template>

<script>
import MixinModal from '@/mixins/modal'
import html2canvas from 'html2canvas'
import printJS from 'print-js'

export const EXPORT_TYPE = {
	PRINT: '인쇄',
	DOWNLOAD: '다운로드',
}

const A4_SIZE = {
	HORIZONTAL: '210mm',
	VERTICAL: '297mm',
}

export default {
	mixins: [MixinModal],
	props: {
		targetElementId: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			type: '',
			labelSize: '',
			label: {
				names: [
					'500L 이상',
					'200L ≤ 용량 < 500L',
					'50L ≤ 용량 < 200L',
					'5L ≤ 용량 < 50L',
					'5L 미만',
				],
				sizes: [
					'276mm x 185mm',
					'228mm x 153mm',
					'190mm x 131mm',
					'131mm x 90mm',
					'92mm x 60mm',
				],
				values: [],
			},
			exportOptions: {},
		}
	},
	created() {
		this.init()
	},
	methods: {
		init() {
			this.label.values = [...this.label.sizes].map(size =>
				this.removeAllBlank(size)
			)
			this.exportOptions = {
				[this.label.values[0]]: { count: 1, isLandscape: true },
				[this.label.values[1]]: { count: 1, isLandscape: true },
				[this.label.values[2]]: { count: 2, isLandscape: false },
				[this.label.values[3]]: { count: 4, isLandscape: true },
				[this.label.values[4]]: { count: 8, isLandscape: false },
			}
		},
		removeAllBlank(str) {
			return str.replaceAll(/\s/g, '')
		},
		show(type = EXPORT_TYPE.PRINT) {
			this.labelSize = this.label.values[0]
			this.type = type
			this.isShow = true
		},
		async onClickEventBtn() {
			await this.initExportElement()

			const targetEl = document.querySelector('#exportDiv')
			targetEl.style = `visibility: visible; position: absolute; top: 2000px; ${
				!this.exportOptions[this.labelSize].isLandscape
					? `width: ${A4_SIZE.HORIZONTAL}; height: ${A4_SIZE.VERTICAL};`
					: `width: ${A4_SIZE.VERTICAL}; height: ${A4_SIZE.HORIZONTAL};`
			}`
			switch (this.type) {
				case EXPORT_TYPE.PRINT:
					await this.print()
					break
				case EXPORT_TYPE.DOWNLOAD:
					await this.download()
					break
				default:
					console.error(
						`${this.type}은(는) 존재하지 않는 출력 타입입니다.`
					)
			}
			targetEl.style = 'visibility: hidden;'
			targetEl.innerHTML = ''

			this.hide()
		},
		async initExportElement() {
			const imgUrl = await this.createImageUrl(
				`#${this.targetElementId}`
			)
			const [width, height] = this.labelSize.split('x')
			const count = this.exportOptions[this.labelSize].count
			for (let i = 0; i < count; i++)
				this.setExportElement(imgUrl, width, height)
		},
		setExportElement(imgUrl, width, height) {
			const imgEl = new Image()
			imgEl.src = imgUrl
			imgEl.style = `width: ${width}; height: ${height}`
			document.querySelector('#exportDiv').appendChild(imgEl)
		},
		async print() {
			printJS({
				printable: await this.createImageURL('#exportDiv'),
				type: 'image',
				style: this.exportOptions[this.labelSize].isLandscape
					? '@page { size: landscape; }'
					: null,
			})
		},
		async download() {
			const aTag = document.createElement('a')
			document.querySelector('#exportDiv').appendChild(aTag)

			aTag.download = 'label.png'
			aTag.href = await this.createImageURL('#exportDiv')
			aTag.click()
		},
		async createImageURL(elementId) {
			const canvas = await html2canvas(
				document.querySelector(elementId),
				{ scale: 3 }
			)
			return canvas.toDataURL('image/png')
		},
	},
}
</script>

<style lang="scss" scoped>
@import '@/styles/scss/global/_common.scss';

.ModalPrintLabel {
	.Popup__container {
		.Popup__content {
			p {
				font-size: 0.876rem;
				color: #666;
				font-weight: 700;
			}
			label {
				display: block;
				width: 100%;
				font-weight: 400;
				font-size: 0.875rem;
				color: #000;
				margin-top: 12px;
				b {
					display: inline-block;
					font-weight: 700;
					padding: 0 8px;
				}
			}
		}
	}
}
</style>
