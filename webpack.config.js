const ExtractTextPlugin = require("extract-text-webpack-plugin");

// [定数] webpack の出力オプションを指定します
// 'production' か 'development' を指定
// モード値を production に設定すると最適化された状態で、
// development に設定するとソースマップ有効でJSファイルが出力される
const MODE = "development";
// ソースマップの利用有無(productionのときはソースマップを利用しない)
const enabledSourceMap = MODE === "development";

module.exports = {
	// メインとなるJavaScriptファイル（エントリーポイント）
	entry: `./src/index.js`,
	// ファイルの出力設定
	output: {
		//  出力ファイルのディレクトリ名
		path: `${__dirname}/dist`,
		// 出力ファイル名
		filename: "main.js",
	},
	mode: MODE,
	module: {
		rules: [{
				// 対象となるファイルの拡張子(scss)
				test: /\.scss$/,
				// Sassファイルの読み込みとコンパイル
				use: ExtractTextPlugin.extract([
					// CSSをバンドルするための機能
					{
						loader: "css-loader",
						options: {
							// オプションでCSS内のurl()メソッドの取り込まない
							url: false,
							// ソースマップの利用有無
							sourceMap: true,
							// 0 => no loaders (default);
							// 1 => postcss-loader;
							// 2 => postcss-loader, sass-loader
							// Sass+PostCSSの場合は2を指定
							importLoaders: 2,
						},
					},
					// PostCSSのための設定
					{
						loader: "postcss-loader",
						options: {
							// PostCSS側でもソースマップを有効にする
							sourceMap: true,
							// ベンダープレフィックスを自動付与する
							plugins: () => [require("autoprefixer")],
						},
					},
					// Sassをバンドルするための機能
					{
						loader: "sass-loader",
						options: {
							// ソースマップの利用有無
							sourceMap: enabledSourceMap,
						},
					},
				]),
			},
			{
				// 対象となるファイルの拡張子
				test: /\.(gif|png|jpg|eot|wof|woff|woff2|ttf|svg)$/,
				// 画像をBase64として取り込む
				loader: "url-loader",
			},
		],
	},
	plugins: [new ExtractTextPlugin("style.css")],
	// source-map方式でないと、CSSの元ソースが追跡できないため
	devtool: "source-map",
};