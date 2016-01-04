module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            compile: {
                src: [
                    "./**/*.t.ts",
                    "./**/*.i.ts"
                ],
                options: {
                    target: 'es5',
                    module: 'commonjs',
                    declaration: false,
                    removeComments: true,
                    sourceMap: false
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-ts");

    grunt.registerTask('default', ['ts']);
};